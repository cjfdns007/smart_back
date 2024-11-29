import redisClient from '../redis/redis';
import { Request, Response, NextFunction } from 'express';
import { verifyToken, getFCM } from '../auth/auth';
import { sensorDateRange, sensorQuery, sensorTypes, sensorValueName } from './const';
import { ResultSetHeader } from 'mysql2/promise';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

initializeApp({
    credential: applicationDefault(),
});

export const test = async (req: Request, res: Response, next: NextFunction) => {
    const testFCM =
        'fVgs28FCQwGWMa9t2FkjVI:APA91bFWSRRz0qLlV9NlxI9iqEFR4HaRfaO-2Y4OHPKtQksOVPIMws6ujICvNomCcDqgaVUE2UZPGjBzu2JHW-6oyxBo1wdlMFKnLIdNJdCpHz6iLRiSJCk';
    const message = {
        notification: { title: '테스트 메세지', body: '잘 가려나' },
        token: testFCM,
    };
    getMessaging()
        .send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
            res.status(200).send('OK');
        })
        .catch((error) => {
            console.log('Error sending message:', error);
            res.status(400).send('ERROR');
        });
};
