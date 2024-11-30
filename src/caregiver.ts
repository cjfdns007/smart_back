import { Request, Response, NextFunction } from 'express';
import { getIDandKind, verifyToken } from '../auth/auth';
import { getConnection } from '../mysql/mysql';

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
        const query = 'select ID from user.elderly where email = ?';
        let [result] = await connection.query(query, [email]);
        let row = JSON.parse(JSON.stringify(result))[0];
        if (!row) {
            res.status(400).send('No such email for elderly');
            return;
        }
        let elderlyID = row['ID'];

        // caregiver의 elderly가 꽉 찼는지 확인
        const selectQuery = 'select Elderly, Elderly2, Elderly3, Elderly4 from user.caregiver where ID = ?';
        [result] = await connection.query(selectQuery, [ID]);
        row = JSON.parse(JSON.stringify(result))[0];
        let { Elderly, Elderly2, Elderly3, Elderly4 } = row;

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
