import express from 'express';
import { AddWalkingData } from '../src/elderly';

const router = express.Router();

router.post('/walking', AddWalkingData);

export default router;
