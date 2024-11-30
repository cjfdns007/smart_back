import { Request, Response, NextFunction } from 'express';
import redisClient from '../redis/redis';
import { getConnection } from '../mysql/mysql';
import { ResultSetHeader } from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { userType } from '../src/const';

dotenv.config({ path: '.env' });

const encrypt = (word: string) => {
    const saltWord = word + process.env.salt;
    const hashWord = crypto.createHash('sha512').update(saltWord).digest('hex');
    return hashWord;
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    let { email, password, FCM } = req.body;
    password = encrypt(password);
    let connection = await getConnection();
    if (!connection) {
        res.status(500).send('DB connection error');
        return;
    }
    try {
        // 로그인 확인
        let query = 'select ID, elderly from user.logInfo where email = ? and password = ?';
        let [result] = await connection.query(query, [email, password]);
        let row = JSON.parse(JSON.stringify(result))[0];
        let { ID, elderly } = row;

        // 이름 가져오기
        let nameQuery = 'select name from user.' + userType[elderly] + ' where ID = ?';
        [result] = await connection.query(nameQuery, [ID]);
        row = JSON.parse(JSON.stringify(result))[0];
        let { name } = row;

        // redis에 token에 대한 ID와 elderly 정보 저장
        let value = JSON.stringify({ ID, elderly });
        const secret = '' + process.env.JWT_SECRET;
        const token = jwt.sign({ ID: ID }, secret);
        const b = await redisClient.set(token, value);
        redisClient.expire(token, 7200);
        console.log(b);

        // redis에 ID에 대한 FCM 정보 저장
        const b2 = await redisClient.set(ID, FCM);
        res.status(200).send({ accessToken: token, expire: 7200, elderly: elderly, name: name });
    } catch (e) {
        console.log(e);
        res.status(400).send('No such ID or password');
    } finally {
        connection.release();
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    // 토큰 검증
    const bool = await verifyToken(req);
    if (!bool) {
        res.status(200).send('OK');
        return;
    }
    // redis에서 해당 토큰 삭제
    const { authorization } = req.headers;
    const [tokenType, token] = authorization!.split(' ');
    const result = await redisClient.del(token);
    console.log(result);
    const { ID } = await getIDandKind(req);
    const result2 = await redisClient.del(ID);
    console.log(result2);
    if (result && result2) {
        res.status(200).send('OK');
        return;
    } else {
        res.status(400).send('error');
    }
};

export const verifyToken = async (req: Request) => {
    const { authorization } = req.headers;
    if (authorization == undefined) {
        return false;
    }
    const [tokenType, token] = authorization.split(' ');
    if (tokenType != 'Bearer') {
        return false;
    }
    const bool = await redisClient.exists(token);
    if (bool) {
        return true;
    }
    return false;
};

export const getIDandKind = async (req: Request) => {
    const { authorization } = req.headers;
    const [tokenType, token] = authorization!.split(' ');
    let value = await redisClient.get(token);
    if (value == null) {
        return { ID: null, elderly: null };
    }
    let result = JSON.parse(value);
    const { ID, elderly } = result;
    return { ID, elderly };
};

export const getFCM = async (req: Request) => {
    const { authorization } = req.headers;
    const [tokenType, token] = authorization!.split(' ');
    let value = await redisClient.get(token);
    if (value == null) {
        return { FCM: null };
    }
    let result = JSON.parse(value);
    const { FCM } = result;
    return { FCM };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    let { name, email, password, phone, elderly } = req.body;
    password = encrypt(password);
    // db 연결
    let connection = await getConnection();
    if (!connection) {
        res.status(500).send('DB connection error');
        return;
    }

    try {
        let insertQuery: string = 'insert into ';
        // elderly인지 caregiver인지 체크 (1 or 0)
        if (elderly) {
            insertQuery += 'user.elderly';
        } else {
            insertQuery += 'user.caregiver';
        }
        insertQuery += '(name, email, phone) values (?, ?, ?)';
        let [results, _] = await connection.query<ResultSetHeader>(insertQuery, [name, email, phone]);
        let insertId = results.insertId;

        // login 관련 정보 저장
        let insertQuery2: string = 'insert into user.logInfo(email, password, ID, elderly) values (?, ?, ?, ?)';
        await connection.query<ResultSetHeader>(insertQuery2, [email, password, insertId, elderly]);
        connection.commit();
        res.status(200).end('OK');
    } catch (e) {
        console.log(e);
        res.status(400).end('error');
        connection.rollback();
    } finally {
        connection.release();
    }
};

export const test = async (req: Request, res: Response, next: NextFunction) => {
    console.log(encrypt('test'));
};
