import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
    res.send('server');
    console.log('someone came');
});

app.listen(process.env.PORT, () => {
    console.log('listening:' + `${process.env.PORT}`);
});
