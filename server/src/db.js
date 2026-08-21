import mysql from 'mysql2/promise';

const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_NAME'];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing environment variable: ${variable}`);
  }
}

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  charset: 'utf8mb4',
  timezone: 'Z',
});

export async function testDatabaseConnection() {
  const connection = await db.getConnection();

  try {
    await connection.ping();
    console.log(
      `MySQL connected: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${
        process.env.DB_NAME
      }`,
    );
  } finally {
    connection.release();
  }
}
