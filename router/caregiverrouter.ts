import express from 'express';
import { elderlyInfo, elderlyRegister } from '../src/caregiver';

const router = express.Router();

router.get('/elderlyInfo', elderlyInfo);
router.post('/elderlyRegister', elderlyRegister);

export default router;
