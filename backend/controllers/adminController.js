const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const testConnectivity = (req, res) => {
    res.json({ message: 'Backend Admin API is reachable' });
};

const login = async (req, res) => {
    const { username, password } = req.body;
    console.log('Admin login attempt for username:', username);

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const admin = await adminModel.findAdminByUsername(username);
        console.log('Admin query result:', admin ? 'found' : 'not found');

        if (!admin) {
            console.log('No admin found with username:', username);
            return res.status(400).json({ message: 'Invalid admin credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Password mismatch for admin:', username);
            return res.status(400).json({ message: 'Invalid admin credentials' });
        }

        const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        console.log('Admin login successful for:', username);
        res.json({ token, id: admin.id, username: admin.username });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during admin login' });
    }
};

const createAdmin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Note: Ensuring table exists is done in db.js on connection, so we assume it exists here or handled globally
        const hashedPassword = await bcrypt.hash(password, 10);
        await adminModel.createAdmin(username, hashedPassword);

        res.json({ message: 'Admin account created successfully', username });
    } catch (error) {
        console.error('Admin creation error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Admin username already exists' });
        }
        res.status(500).json({ message: 'Server error creating admin account' });
    }
};

const checkAdmins = async (req, res) => {
    try {
        const admins = await adminModel.getAllAdmins();
        res.json({
            message: 'Admin accounts found',
            count: admins.length,
            admins: admins
        });
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            message: 'Error checking admin accounts',
            error: error.message
        });
    }
};

module.exports = {
    testConnectivity,
    login,
    createAdmin,
    checkAdmins
};
