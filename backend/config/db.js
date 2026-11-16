import mysql from 'mysql2/promise';
import 'dotenv/config';

export default mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true, // las fechas vuelven como 'YYYY-MM-DD'
  waitForConnections: true,
});
