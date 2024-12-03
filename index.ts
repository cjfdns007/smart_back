import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './router/authrouter';
import sensorRouter from './router/sensorrouter';
import caregiverRouter from './router/caregiverrouter';
import elderlyRouter from './router/elderlyrouter';

dotenv.config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/sensor', sensorRouter);
app.use('/caregiver', caregiverRouter);
app.use('/elderly', elderlyRouter);

app.get('/', (req: Request, res: Response) => {
    res.send('server');
    console.log('someone came');
});

app.listen(process.env.PORT, () => {
    console.log('listening:' + `${process.env.PORT}`);
});
