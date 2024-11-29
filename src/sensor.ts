import redisClient from '../redis/redis';
import { getDatabase } from '../mysql/mysql';
import { Request, Response, NextFunction } from 'express';
import { verifyToken, getIDandKind } from '../auth/auth';
import { sensorDateRange, sensorQuery, sensorTypes, sensorValueName } from './const';
import { ResultSetHeader } from 'mysql2/promise';

export const sensorRegister = async (req: Request, res: Response, next: NextFunction) => {
    // sensor type 체크
    const type = req.body['type'];
    if (type == null || !sensorTypes.includes(type)) {
        res.status(400).send('Invalid Type');
        return;
    }
    let userID;
    // 토큰 확인 및 user ID와 elderly 체크
    try {
        let b: boolean = await verifyToken(req);
        if (!b) {
            res.status(400).send('Invalid Token');
            return;
        }
        const { ID, elderly } = await getIDandKind(req);
        if (ID == null) {
            res.status(400).send('Invalid Token');
            return;
        }
        userID = ID;
        if (!elderly) {
            res.status(400).send('Caregiver user cannot register own sensors');
        }
    } catch (e) {
        console.log(e);
        res.status(400).send('error');
        return;
    }
    // db 커넥션
    let connection;
    try {
        connection = await getDatabase();
        await connection.beginTransaction();
    } catch (e) {
        console.log(e);
        res.status(500).send('DB connection error');
        return;
    }
    // 커넥션 이후 sensor 추가
    if (connection) {
        try {
            let query = 'select * from data.sensor where elderlyID = ? and type = ?';
            let { name, type } = req.body;
            let [result] = await connection.query(query, [userID, type]);
            let row = JSON.parse(JSON.stringify(result));
            if (row.length) {
                res.status(400).send('This type of sensor already exists');
                return;
            }
            let insertQuery = 'insert into data.sensor(elderlyID, name, type) values (?, ?, ?)';
            await connection.query<ResultSetHeader>(insertQuery, [userID, name, type]);
            connection.commit();
            res.status(200).send('OK');
        } catch (e) {
            res.status(400).send('No such ID or password');
        } finally {
            connection.release();
        }
    }
};

export const sensorInfo = async (req: Request, res: Response, next: NextFunction) => {
    let userID;
    // 토큰 확인 및 user ID와 elderly 체크
    try {
        let b: boolean = await verifyToken(req);
        if (!b) {
            res.status(400).send('Invalid Token');
            return;
        }
        const { ID, elderly } = await getIDandKind(req);
        if (ID == null) {
            res.status(400).send('Invalid Token');
            return;
        }
        userID = ID;
        if (!elderly) {
            res.status(400).send('Caregiver user does not have own sensors');
        }
    } catch (e) {
        console.log(e);
        res.status(400).send('error');
        return;
    }
    // db 커넥션
    let connection;
    try {
        connection = await getDatabase();
        await connection.beginTransaction();
    } catch (e) {
        console.log(e);
        res.status(500).send('DB connection error');
        return;
    }
    //커넥션 이후 sensor 정보 뽑아오기
    if (connection) {
        try {
            let query = 'select sensorID, name, type from data.sensor where elderlyID = ?';
            let [result] = await connection.query(query, [userID]);
            let rows = JSON.parse(JSON.stringify(result));
            let body = [];
            for (var i = 0; i < rows.length; i++) {
                let { sensorID, name, type } = rows[i];
                body.push({ sensorID: sensorID, name: name, type: type });
            }
            res.status(200).send({ sensors: body });
        } catch (e) {
            console.log(e);
            res.status(400).send('No such ID or password');
        } finally {
            connection.release();
        }
    }
};

export const sensorData = async (req: Request, res: Response, next: NextFunction) => {
    const { ID, time, value } = req.body;
    // db 커넥션
    let connection;
    try {
        connection = await getDatabase();
        await connection.beginTransaction();
    } catch (e) {
        console.log(e);
        res.status(500).send('DB connection error');
        return;
    }
    //커넥션 이후 sensor 정보 뽑아오기
    if (connection) {
        try {
            let query = 'select elderlyID, type from data.sensor where sensorID = ?';
            let [result] = await connection.query(query, [ID]);
            let rows = JSON.parse(JSON.stringify(result));
            // 뽑아온 sensor 데이터에 맞는 elderlyID로 저장
            let { elderlyID, type } = rows[0];
            if (sensorTypes.includes(type)) {
                let insertQuery = 'insert into data.' + sensorQuery[type] + ' values(?, ?, ?)';
                await connection.query(insertQuery, [elderlyID, time, value]);
                connection.commit();
            }
            res.status(200).send('OK');
        } catch (e) {
            console.log(e);
            res.status(400).send('failed');
        } finally {
            connection.release();
        }
    }
};

const sensorGetData = async (req: Request, res: Response, next: NextFunction, type: string) => {
    let elderlyID;
    try {
        let { ID, elderly } = await getIDandKind(req);
        elderlyID = ID;
    } catch (e) {
        console.log(e);
        res.status(400).send('token error');
        return;
    }
    // db 커넥션
    let connection;
    try {
        connection = await getDatabase();
        await connection.beginTransaction();
    } catch (e) {
        console.log(e);
        res.status(500).send('DB connection error');
        return;
    }
    //커넥션 이후 sensor 정보 뽑아오기
    if (connection) {
        try {
            let query = `select time, ${sensorValueName[type]} from data.${type} where elderlyID = ? and time >= ?`;
            let t = new Date();
            t.setSeconds(t.getSeconds() - sensorDateRange[type]);
            let timeString = `${t.getFullYear()}-${('0' + (t.getMonth() + 1)).slice(-2)}-${('0' + t.getDate()).slice(
                -2
            )} `;
            timeString += `${('0' + t.getHours()).slice(-2)}:${('0' + t.getMinutes()).slice(-2)}:${(
                '0' + t.getSeconds()
            ).slice(-2)}`;
            let [result] = await connection.query(query, [elderlyID, timeString]);
            let rows = JSON.parse(JSON.stringify(result));
            let times = [];
            let values = [];
            for (var i = 0; i < rows.length; i++) {
                let time = new Date(rows[i].time);
                let timeString = `${time.getFullYear()}-${('0' + (time.getMonth() + 1)).slice(-2)}-${(
                    '0' + time.getDate()
                ).slice(-2)} `;
                timeString += `${('0' + time.getHours()).slice(-2)}:${('0' + time.getMinutes()).slice(-2)}:${(
                    '0' + time.getSeconds()
                ).slice(-2)}`;
                let value = rows[i][`${sensorValueName[type]}`];
                times.push(timeString);
                values.push(value);
            }
            let body: { [key: string]: any[] } = {};
            body['time'] = times;
            body[`${sensorValueName[type]}`] = values;
            res.status(200).send(body);
        } catch (e) {
            console.log(e);
            res.status(400).send('failed');
        } finally {
            connection.release();
        }
    }
};

export const outdoor = async (req: Request, res: Response, next: NextFunction) => {
    await sensorGetData(req, res, next, 'outdoor');
};

export const heartRate = async (req: Request, res: Response, next: NextFunction) => {
    await sensorGetData(req, res, next, 'heartRate');
};

export const medicine = async (req: Request, res: Response, next: NextFunction) => {
    await sensorGetData(req, res, next, 'medicine');
};

export const walking = async (req: Request, res: Response, next: NextFunction) => {
    await sensorGetData(req, res, next, 'walking');
};