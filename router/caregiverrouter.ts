import express from 'express';
import { elderlyInfo, elderlyRegister, elderlyRemove, sensorData } from '../src/caregiver';

const router = express.Router();

router.get('/elderlyInfo', elderlyInfo);
router.post('/elderlyRegister', elderlyRegister);
router.post('/elderlyRemove', elderlyRemove);
router.get('/sensorData', sensorData);

export default router;
