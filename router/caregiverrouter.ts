import express from 'express';
import { elderlyInfo, elderlyRegister, elderlyRemove, sensorAllData, sensorData } from '../src/caregiver';

const router = express.Router();

router.get('/elderlyInfo', elderlyInfo);
router.post('/elderlyRegister', elderlyRegister);
router.post('/elderlyRemove', elderlyRemove);
router.post('/sensorData', sensorData);
router.post('/sensorAllData', sensorAllData);

export default router;
