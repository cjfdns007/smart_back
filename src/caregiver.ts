import { Request, Response, NextFunction } from 'express';
import { getIDandKind, verifyToken } from '../auth/auth';
import { getConnection } from '../mysql/mysql';
import { sensorAll, sensorGetData } from './sensor';
import { sensorTypes } from './const';

export const elderlyRegister = async (req: Request, res: Response, next: NextFunction) => {
    // 토큰 체크
    const tokenCheck = await verifyToken(req);
    if (!tokenCheck) {
        res.status(400).send('Invalid Token');
        return;
    }
    // ID와 elderly 정보 확인
    const { ID, elderly } = await getIDandKind(req);
    if (elderly) {
        res.status(400).send('Elderly User cannot use this function');
        return;
    }
    // 이메일 정보 체크
    const { email } = req.body;
    if (!email) {
        res.status(400).send('Invalid body: No email');
        return;
    }
    // DB 연결
    let connection = await getConnection();
    if (!connection) {
        res.status(500).send('DB connection error');
        return;
    }
    try {
        // elderly ID 가져오기
        const query = 'select ID, Caregiver from user.elderly where email = ?';
        let [result] = await connection.query(query, [email]);
        let row = JSON.parse(JSON.stringify(result))[0];
        if (!row) {
            res.status(400).send('No such email for elderly');
            return;
        }
        let elderlyID = row['ID'];
        let Caregiver = row['Caregiver'];
        if (Caregiver) {
            res.status(400).send('The elderly already has a caregiver');
            return;
        }
        const query2 = 'update user.elderly set Caregiver = ? where ID = ?';
        await connection.query(query2, [ID, elderlyID]);
        // caregiver의 elderly가 꽉 찼는지 확인
        const selectQuery = 'select Elderly, Elderly2, Elderly3, Elderly4 from user.caregiver where ID = ?';
        [result] = await connection.query(selectQuery, [ID]);
        row = JSON.parse(JSON.stringify(result))[0];
        let { Elderly, Elderly2, Elderly3, Elderly4 } = row;

        // 이미 등록되어있는 elderly인 경우 처리
        if (Elderly == elderlyID || Elderly2 == elderlyID || Elderly3 == elderlyID || Elderly4 == elderlyID) {
            res.status(400).send('Already exists');
            return;
        }
        // Elderly중 빈 곳을 찾아서 insert
        if (!Elderly) {
            const insertQuery = 'update user.caregiver set Elderly = ? where ID = ?';
            await connection.query(insertQuery, [elderlyID, ID]);
            connection.commit();
        } else if (!Elderly2) {
            const insertQuery = 'update user.caregiver set Elderly2 = ? where ID = ?';
            await connection.query(insertQuery, [elderlyID, ID]);
            connection.commit();
        } else if (!Elderly3) {
            const insertQuery = 'update user.caregiver set Elderly3 = ? where ID = ?';
            await connection.query(insertQuery, [elderlyID, ID]);
            connection.commit();
        } else if (!Elderly4) {
            const insertQuery = 'update user.caregiver set Elderly4 = ? where ID = ?';
            await connection.query(insertQuery, [elderlyID, ID]);
            connection.commit();
        } else {
            res.status(400).send('Elderly number cannot be over 4');
            return;
        }

        res.status(200).send('OK');
    } catch (e) {
        console.log(e);
        await connection.rollback();
        res.status(400).send('error');
    } finally {
        connection.release();
    }
};

export const elderlyInfo = async (req: Request, res: Response, next: NextFunction) => {
    // 토큰 체크
    const tokenCheck = await verifyToken(req);
    if (!tokenCheck) {
        res.status(400).send('Invalid Token');
        return;
    }
    // ID, elderly 정보 가져오기
    const { ID, elderly } = await getIDandKind(req);
    if (elderly) {
        res.status(400).send('Elderly cannot use this function');
        return;
    }
    // DB 연결
    let connection = await getConnection();
    if (!connection) {
        res.status(500).send('DB connection error');
        return;
    }
    try {
        const query = 'select Elderly, Elderly2, Elderly3, Elderly4 from user.caregiver where ID = ?';
        let [result] = await connection.query(query, [ID]);
        let row = JSON.parse(JSON.stringify(result))[0];
        let { Elderly, Elderly2, Elderly3, Elderly4 } = row;
        let body = [];
        const selectQuery = 'select name from user.elderly where ID = ?';
        if (Elderly) {
            let [ElderlyResult] = await connection.query(selectQuery, [Elderly]);
            let row = JSON.parse(JSON.stringify(ElderlyResult))[0];
            let { name } = row;
            body.push({ ID: Elderly, name: name });
        }
        if (Elderly2) {
            let [ElderlyResult2] = await connection.query(selectQuery, [Elderly2]);
            let row = JSON.parse(JSON.stringify(ElderlyResult2))[0];
            let { name } = row;
            body.push({ ID: Elderly2, name: name });
        }
        if (Elderly3) {
            let [ElderlyResult3] = await connection.query(selectQuery, [Elderly3]);
            let row = JSON.parse(JSON.stringify(ElderlyResult3))[0];
            let { name } = row;
            body.push({ ID: Elderly3, name: name });
        }
        if (Elderly4) {
            let [ElderlyResult4] = await connection.query(selectQuery, [Elderly4]);
            let row = JSON.parse(JSON.stringify(ElderlyResult4))[0];
            let { name } = row;
            body.push({ ID: Elderly4, name: name });
        }
        res.status(200).send({ elderlyInfo: body });
    } catch (e) {
        console.log(e);
        res.status(400).send('error');
    } finally {
        connection.release();
    }
};

export const elderlyRemove = async (req: Request, res: Response, next: NextFunction) => {
    // 토큰 체크
    const tokenCheck = await verifyToken(req);
    if (!tokenCheck) {
        res.status(400).send('Invalid Token');
        return;
    }
    // ID, elderly 정보 가져오기
    const { ID, elderly } = await getIDandKind(req);
    if (elderly) {
        res.status(400).send('Elderly cannot use this function');
        return;
    }
    // 이메일 정보 체크
    const { elderlyID } = req.body;
    if (!elderlyID) {
        res.status(400).send('Invalid body: No elderlyID');
        return;
    }
    // DB 연결
    let connection = await getConnection();
    if (!connection) {
        res.status(500).send('DB connection error');
        return;
    }
    try {
        const query = 'select Elderly, Elderly2, Elderly3, Elderly4 from user.caregiver where ID = ?';
        const [result] = await connection.query(query, [ID]);
        const row = JSON.parse(JSON.stringify(result))[0];
        const { Elderly, Elderly2, Elderly3, Elderly4 } = row;
        if (Elderly == elderlyID) {
            const updateQuery = 'update user.caregiver set Elderly = NULL where ID = ?';
            await connection.query(updateQuery, [ID]);
        } else if (Elderly2 == elderlyID) {
            const updateQuery = 'update user.caregiver set Elderly2 = NULL where ID = ?';
            await connection.query(updateQuery, [ID]);
        } else if (Elderly3 == elderlyID) {
            const updateQuery = 'update user.caregiver set Elderly3 = NULL where ID = ?';
            await connection.query(updateQuery, [ID]);
        } else if (Elderly4 == elderlyID) {
            const updateQuery = 'update user.caregiver set Elderly4 = NULL where ID = ?';
            await connection.query(updateQuery, [ID]);
        } else {
            res.status(400).send('No such elderly for caregiver');
            return;
        }
        res.status(200).send('OK');
    } catch (e) {
        console.log(e);
        res.status(400).send('error occured');
    } finally {
        connection.release();
    }
};

const elderlyCheck = async (ID: number, elderlyID: number) => {
    // DB 연결
    let connection = await getConnection();
    if (!connection) {
        return false;
    }
    try {
        const query = 'select Elderly, Elderly2, Elderly3, Elderly4 from user.caregiver where ID = ?';
        const [result] = await connection.query(query, [ID]);
        const row = JSON.parse(JSON.stringify(result))[0];
        const { Elderly, Elderly2, Elderly3, Elderly4 } = row;
        if (Elderly == elderlyID || Elderly2 == elderlyID || Elderly3 == elderlyID || Elderly4 == elderlyID) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    } finally {
        connection.release();
    }
};

export const sensorData = async (req: Request, res: Response, next: NextFunction) => {
    const { elderlyID, type } = req.body;
    if (!elderlyID || !type) {
        res.status(400).send('No elderly ID or type');
        return;
    }
    // sensor type 체크
    if (type == null || !sensorTypes.includes(type)) {
        res.status(400).send('Invalid Type');
        return;
    }
    const { ID } = await getIDandKind(req);
    const check = await elderlyCheck(ID, elderlyID);
    if (!check) {
        res.status(400).send("You don't have permission to such elderly");
        return;
    }
    await sensorGetData(req, res, next, type, elderlyID);
};

export const sensorAllData = async (req: Request, res: Response, next: NextFunction) => {
    const { elderlyID } = req.body;
    if (!elderlyID) {
        res.status(400).send('No elderly ID');
        return;
    }
    const { ID } = await getIDandKind(req);
    const check = await elderlyCheck(ID, elderlyID);
    if (!check) {
        res.status(400).send("You don't have permission to such elderly");
        return;
    }
    await sensorAll(req, res, next, elderlyID);
};
