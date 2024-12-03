import { getConnection } from '../mysql/mysql';
import { Request, Response, NextFunction } from 'express';
import { verifyToken, getIDandKind } from '../auth/auth';

export const AddWalkingData = async (req: Request, res: Response, next: NextFunction) => {
    const tokenCheck = await verifyToken(req);
    if (!tokenCheck) {
        res.status(400).send('Invalid Token');
        return;
    }
    const { ID, elderly } = await getIDandKind(req);
    if (!elderly) {
        res.status(400).send('Only elderly can use this function');
        return;
    }
    const { time, walk } = req.body;
    // db 커넥션
    let connection = await getConnection();
    if (!connection) {
        res.status(500).send('DB connection error');
        return;
    }
    //커넥션 이후 저장하기
    try {
        let insertQuery = 'insert into data.walking values(?, ?, ?)';
        await connection.query(insertQuery, [ID, time, walk]);
        connection.commit();
        res.status(200).send('OK');
    } catch (e) {
        console.log(e);
        res.status(400).send('failed');
    } finally {
        connection.release();
    }
};
