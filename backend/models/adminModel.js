const { pool } = require('../config/db');

const createAdmin = async (username, hashedPassword) => {
    await pool.execute(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        [username, hashedPassword]
    );
};

const findAdminByUsername = async (username) => {
    const [rows] = await pool.execute('SELECT id, username, password_hash FROM admins WHERE username = ?', [username]);
    return rows[0];
};

const getAllAdmins = async () => {
    const [rows] = await pool.execute('SELECT id, username, created_at FROM admins');
    return rows;
};

module.exports = {
    createAdmin,
    findAdminByUsername,
    getAllAdmins
};
