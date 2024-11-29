import express from 'express';
import { login, logout, test, register } from '../auth/auth';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/test', test);
router.post('/register', register);

export default router;
