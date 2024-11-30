import redisClient from '../redis/redis';
import { Request, Response, NextFunction } from 'express';
import { verifyToken, getFCM } from '../auth/auth';
import { sensorDateRange, sensorQuery, sensorTypes, sensorValueName } from './const';
import { ResultSetHeader } from 'mysql2/promise';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

initializeApp({
    credential: applicationDefault(),
});

export const notify = async (message: Message) => {
    getMessaging()
        .send(message)
        .then((response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
};
