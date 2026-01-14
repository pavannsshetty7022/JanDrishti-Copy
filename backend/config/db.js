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

        await checkAndCreateAdminTable();
        await checkAndUpdateIssuesTable();

        connection.release();
    } catch (err) {
        console.error('Error connecting to MySQL database:', err.message);
    }
};

const checkAndCreateAdminTable = async () => {
    try {
        console.log('Checking if admin table exists...');
        const [adminRows] = await pool.execute('SELECT COUNT(*) as count FROM admins');
        console.log('Admin count:', adminRows[0].count);
        console.log('Admin accounts exist');
    } catch (error) {
        console.error('Error with admin table:', error.message);
        try {
            console.log('Attempting to create admin table...');
            await pool.execute(`
        CREATE TABLE IF NOT EXISTS admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            console.log('Admin table created successfully');
        } catch (createError) {
            console.error('Failed to create admin table:', createError.message);
        }
    }
};

const checkAndUpdateIssuesTable = async () => {
    try {
        console.log('Ensuring issues table has latitude and longitude columns...');
        await pool.execute(`
        ALTER TABLE issues 
        ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
        ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8)
      `);
        console.log('Issues table schema updated');
    } catch (error) {
        if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_TABLE_ERROR') {
            try {
                const [columns] = await pool.execute('SHOW COLUMNS FROM issues LIKE "latitude"');
                if (columns.length === 0) {
                    await pool.execute('ALTER TABLE issues ADD COLUMN latitude DECIMAL(10, 8), ADD COLUMN longitude DECIMAL(11, 8)');
                    console.log('Issues table schema updated (fallback)');
                }
            } catch (innerError) {
                console.error('Failed to update issues schema:', innerError.message);
            }
        } else if (error.code === 'ER_DUP_COLUMNNAME') {
            console.log('Latitude/Longitude columns already exist');
        } else {
            console.error('Error updating issues schema:', error.message);
        }
    }
};

module.exports = { pool, connectDB };
