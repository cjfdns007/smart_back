import express from 'express';
import { sensorData, sensorInfo, sensorRegister, sensorRemove } from '../src/sensor';
import { test } from '../src/notification';

const router = express.Router();

router.post('/register', sensorRegister);
router.get('/info', sensorInfo);
router.post('/data', sensorData);
router.get('/test', test);
router.post('/remove', sensorRemove);

export default router;
