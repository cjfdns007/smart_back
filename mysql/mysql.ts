import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_username,
    password: process.env.DB_password,
    connectionLimit: 4,
});

export const getDatabase = () => {
    return pool.promise().getConnection();
};
