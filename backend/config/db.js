const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database!');
    connection.release();

    await ensureAdminTable();
    await ensureIssuesSchema();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};

const ensureAdminTable = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const ensureIssuesSchema = async () => {
  const [latColumn] = await pool.execute(
    `SHOW COLUMNS FROM issues LIKE 'latitude'`
  );

  if (latColumn.length === 0) {
    await pool.execute(`
      ALTER TABLE issues
      ADD COLUMN latitude DECIMAL(10,8),
      ADD COLUMN longitude DECIMAL(11,8)
    `);
  }
};

module.exports = { pool, connectDB };
