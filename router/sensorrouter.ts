import express from 'express';
import { heartRate, medicine, outdoor, sensorData, sensorInfo, sensorRegister, walking } from '../src/sensor';
import { test } from '../src/notification';

const router = express.Router();

router.post('/register', sensorRegister);
router.get('/sensor', sensorInfo);
router.post('/data', sensorData);
router.get('/heartRate', heartRate);
router.get('/medicine', medicine);
router.get('/outdoor', outdoor);
router.get('/walking', walking);
router.get('/test', test);

export default router;
