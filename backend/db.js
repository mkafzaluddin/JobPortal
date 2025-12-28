import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: true,                
    trustServerCertificate: true, 
  },
};

export default dbConfig;

export async function connectDB() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Connected to SQL Server!');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}
