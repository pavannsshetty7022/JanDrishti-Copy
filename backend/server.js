require('dotenv').config();

const express = require('express');
const { Server } = require('socket.io');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
const server = require('http').createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: ["http://localhost:5100", "http://localhost:5200"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type'],
}));

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5100", "http://localhost:5200"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(async (connection) => {
    console.log('Successfully connected to MySQL database!');
    try {
      console.log('Checking if admin table exists...');
      const [adminRows] = await pool.execute('SELECT COUNT(*) as count FROM admins');
      console.log('Admin count:', adminRows[0].count);

      console.log('Admin accounts exist');
    } catch (error) {
      console.error('Error with admin table:', error.message);
      console.error('Full error:', error);

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

        console.log('Admin table created, no default admin created');
      } catch (createError) {
        console.error('Failed to create admin table:', createError.message);
      }
    }

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

    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL database:', err.message);
    process.exit(1);
  });

app.use(cors({
  origin: ["http://localhost:5100", "http://localhost:5200"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });

app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

app.get('/api/admin/test-connectivity', (req, res) => {
  res.json({ message: 'Backend Admin API is reachable' });
});

app.get('/api/admin/get-single-issue/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const issueDbId = req.params.id;
  console.log(`[ADMIN] Fetching single issue ID: ${issueDbId}`);
  try {
    const [rows] = await pool.execute(`
      SELECT
          i.*,
          u.full_name, u.phone_number, u.address, u.user_type, u.user_type_custom
      FROM issues i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `, [issueDbId]);

    if (rows.length === 0) {
      console.log(`[ADMIN] Issue not found: ${issueDbId}`);
      return res.status(404).json({ message: 'Issue not found' });
    }

    const issue = rows[0];
    if (issue.media_paths && typeof issue.media_paths === 'string') {
      try {
        issue.media_paths = JSON.parse(issue.media_paths);
      } catch (parseError) {
        issue.media_paths = [];
      }
    }

    console.log(`[ADMIN] Successfully fetched issue: ${issue.issue_id}`);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(issue);
  } catch (error) {
    console.error('[ADMIN] Fetch single issue error:', error);
    res.status(500).json({ message: 'Server error fetching issue details', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password, fullName, phoneNumber, address, userType, userTypeCustom } = req.body;

  if (!username || !password || !fullName || !phoneNumber || !address || !userType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, full_name, phone_number, address, user_type, user_type_custom) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, fullName, phoneNumber, address, userType, userTypeCustom || null]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      id: userId,
      username,
      profileCompleted: true
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const [rows] = await pool.execute('SELECT id, password_hash, full_name IS NOT NULL AS profile_completed FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, id: user.id, username: user.username, profileCompleted: user.profile_completed });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Admin login attempt for username:', username);

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const [rows] = await pool.execute('SELECT id, username, password_hash FROM admins WHERE username = ?', [username]);
    console.log('Admin query result:', rows.length, 'rows found');

    if (rows.length === 0) {
      console.log('No admin found with username:', username);
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }
    const admin = rows[0];
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
});

app.post('/api/admin/create', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.json({ message: 'Admin account created successfully', username });
  } catch (error) {
    console.error('Admin creation error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Admin username already exists' });
    }
    res.status(500).json({ message: 'Server error creating admin account' });
  }
});

app.get('/api/admin/check', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, created_at FROM admins');
    res.json({
      message: 'Admin accounts found',
      count: rows.length,
      admins: rows
    });
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      message: 'Error checking admin accounts',
      error: error.message
    });
  }
});

app.post('/api/auth/profile', authenticateToken, async (req, res) => {
  const { fullName, phoneNumber, address, userType, userTypeCustom } = req.body;
  const userId = req.user.id;

  if (!fullName || !phoneNumber || !address || !userType) {
    return res.status(400).json({ message: 'All profile fields are required' });
  }
  if (userType === 'Other' && !userTypeCustom) {
    return res.status(400).json({ message: 'Custom user type is required when "Other" is selected' });
  }

  try {
    await pool.execute(
      'UPDATE users SET full_name = ?, phone_number = ?, address = ?, user_type = ?, user_type_custom = ? WHERE id = ?',
      [fullName, phoneNumber, address, userType, userTypeCustom || null, userId]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await pool.execute(`
      SELECT u.username, u.full_name, u.phone_number, u.address, u.user_type, u.user_type_custom 
      FROM users u 
      WHERE u.id = ?
    `, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});



app.post('/api/issues', authenticateToken, upload.array('media', 10), async (req, res) => {
  const { title, description, location, dateOfOccurrence, latitude, longitude } = req.body;
  const userId = req.user.id;
  const mediaPaths = req.files && req.files.length > 0 ? JSON.stringify(req.files.map(file => `/uploads/${file.filename}`)) : '[]';
  const issueId = `JDR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  if (!title || !description || !location || !dateOfOccurrence) {
    return res.status(400).json({ message: 'All issue fields are required' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO issues (issue_id, user_id, title, description, location, latitude, longitude, date_of_occurrence, media_paths, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [issueId, userId, title, description, location, latitude || null, longitude || null, dateOfOccurrence, mediaPaths, 'OPEN']
    );

    const [newIssueRows] = await pool.execute(`
      SELECT
          i.id, i.issue_id, i.user_id, i.title, i.description, i.location,
          i.date_of_occurrence, i.media_paths, i.status, i.created_at,
          u.full_name, u.phone_number, u.address, u.user_type, u.user_type_custom
      FROM issues i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `, [result.insertId]);

    const newIssue = newIssueRows[0];
    if (newIssue && typeof newIssue.media_paths === 'string') {
      newIssue.media_paths = JSON.parse(newIssue.media_paths);
    }

    io.emit('new_issue', newIssue);
    res.status(201).json({ message: 'Issue reported successfully', issueId: issueId, issue: newIssue });
  } catch (error) {
    console.error('Issue reporting error:', error);
    res.status(500).json({ message: 'Server error reporting issue' });
  }
});

app.get('/api/issues/user/:userId', authenticateToken, async (req, res) => {
  const requestedUserId = parseInt(req.params.userId);
  const authenticatedUserId = req.user.id;

  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ message: 'Unauthorized: You can only view your own issues' });
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM issues WHERE user_id = ? ORDER BY created_at DESC', [requestedUserId]);
    const issuesWithParsedMedia = rows.map(issue => {
      if (issue.media_paths && typeof issue.media_paths === 'string') {
        try {
          return { ...issue, media_paths: JSON.parse(issue.media_paths) };
        } catch (parseError) {
          console.error('Error parsing media_paths for issue ID:', issue.id, parseError);
          return { ...issue, media_paths: [] };
        }
      }
      return issue;
    });
    res.json(issuesWithParsedMedia);
  } catch (error) {
    console.error('Fetch user issues error:', error);
    res.status(500).json({ message: 'Server error fetching user issues' });
  }
});

app.get('/api/issues/search/:issueId', authenticateToken, async (req, res) => {
  const issueId = req.params.issueId;
  const userId = req.user.id;
  try {
    const [rows] = await pool.execute('SELECT * FROM issues WHERE issue_id = ? AND user_id = ?', [issueId, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found for this user' });
    }
    const issue = rows[0];
    if (issue && typeof issue.media_paths === 'string') {
      try {
        issue.media_paths = JSON.parse(issue.media_paths);
      } catch (parseError) {
        console.error('Error parsing media_paths for issue ID:', issue.id, parseError);
        issue.media_paths = [];
      }
    }
    res.json(issue);
  } catch (error) {
    console.error('Search issue error:', error);
    res.status(500).json({ message: 'Server error searching issue' });
  }
});

app.put('/api/issues/:id', authenticateToken, upload.fields([{ name: 'newMedia', maxCount: 10 }, { name: 'existingMedia', maxCount: 20 }]), async (req, res) => {
  const issueDbId = req.params.id;
  const userId = req.user.id;
  const { title, description, location, dateOfOccurrence, latitude, longitude } = req.body;

  let existingMediaPaths = [];
  if (req.body.existingMedia) {
    try {
      existingMediaPaths = JSON.parse(req.body.existingMedia);
    } catch (e) {
      console.error('Error parsing existingMedia JSON from request body:', e);
      return res.status(400).json({ message: 'Invalid existing media data format' });
    }
  }

  const newMediaFiles = req.files && req.files['newMedia'] ? req.files['newMedia'] : [];
  const newMediaPaths = newMediaFiles.map(file => `/uploads/${file.filename}`);

  const allMediaPaths = JSON.stringify([...existingMediaPaths, ...newMediaPaths]);

  if (!title || !description || !location || !dateOfOccurrence) {
    return res.status(400).json({ message: 'All issue fields are required for update' });
  }

  try {
    const [issueRows] = await pool.execute('SELECT status, user_id, media_paths FROM issues WHERE id = ?', [issueDbId]);
    if (issueRows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    const issue = issueRows[0];

    let currentDbMediaPaths = [];
    if (issue.media_paths && typeof issue.media_paths === 'string') {
      try {
        currentDbMediaPaths = JSON.parse(issue.media_paths);
      } catch (parseError) {
        console.error('Error parsing existing DB media_paths for cleanup (issue ID: ' + issue.id + '):', parseError);
        currentDbMediaPaths = [];
      }
    } else if (Array.isArray(issue.media_paths)) {
      currentDbMediaPaths = issue.media_paths;
    }

    const pathsToDelete = currentDbMediaPaths.filter(p => !existingMediaPaths.includes(p));
    pathsToDelete.forEach(filePath => {
      const fullPath = path.join(__dirname, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, (err) => {
          if (err) console.error(`Error deleting old media file: ${fullPath}`, err);
        });
      }
    });

    if (issue.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own issues' });
    }
    if (issue.status.toUpperCase() !== 'OPEN') {
      return res.status(400).json({ message: 'Issue can only be edited if status is "OPEN"' });
    }

    await pool.execute(
      'UPDATE issues SET title = ?, description = ?, location = ?, latitude = ?, longitude = ?, date_of_occurrence = ?, media_paths = ? WHERE id = ?',
      [title, description, location, latitude || null, longitude || null, dateOfOccurrence, allMediaPaths, issueDbId]
    );
    res.json({ message: 'Issue updated successfully' });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ message: 'Server error updating issue' });
  }
});

app.delete('/api/issues/:id', authenticateToken, async (req, res) => {
  const issueDbId = req.params.id;
  const userId = req.user.id;
  try {
    const [issueRows] = await pool.execute('SELECT status, user_id, media_paths FROM issues WHERE id = ?', [issueDbId]);
    if (issueRows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    const issue = issueRows[0];

    if (issue.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own issues' });
    }
    if (issue.status.toUpperCase() !== 'OPEN') {
      return res.status(400).json({ message: 'Issue can only be deleted if status is "OPEN"' });
    }

    let mediaPathsToDelete = [];
    if (issue.media_paths && typeof issue.media_paths === 'string') {
      try {
        mediaPathsToDelete = JSON.parse(issue.media_paths);
      } catch (parseError) {
        console.error('Error parsing media_paths for deletion (issue ID: ' + issue.id + '):', parseError);
        mediaPathsToDelete = [];
      }
    } else if (Array.isArray(issue.media_paths)) {
      mediaPathsToDelete = issue.media_paths;
    }

    if (mediaPathsToDelete.length > 0) {
      mediaPathsToDelete.forEach(filePath => {
        const fullPath = path.join(__dirname, filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) console.error('Error deleting media file:', err);
          });
        }
      });
    }

    await pool.execute('DELETE FROM issues WHERE id = ?', [issueDbId]);
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ message: 'Server error deleting issue' });
  }
});




app.get('/api/issues', authenticateToken, authorizeAdmin, async (req, res) => {
  const { status, search } = req.query;
  let query = `
    SELECT
        i.id, i.issue_id, i.user_id, i.title, i.description, i.location,
        i.date_of_occurrence, i.media_paths, i.status, i.feedback, i.rating,
        i.created_at, i.resolved_at,
        u.full_name, u.phone_number, u.address, u.user_type, u.user_type_custom
    FROM issues i
    JOIN users u ON i.user_id = u.id
  `;
  const params = [];
  const conditions = [];


  console.log('--- ADMIN ISSUES FETCH ---');
  console.log('Request user:', req.user);
  console.log('Status filter:', status);
  console.log('Search query:', search);
  console.log('Raw query:', query);

  if (status) {
    conditions.push('i.status = ?');
    params.push(status);
  }
  if (search) {
    conditions.push('(i.issue_id LIKE ? OR i.title LIKE ? OR i.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY i.created_at DESC';

  console.log('Final SQL query:', query);
  console.log('Query params:', params);

  try {
    const [rows] = await pool.execute(query, params);
    console.log('Fetched rows count:', rows.length);
    const issuesWithParsedMedia = rows.map(issue => {
      if (issue.media_paths && typeof issue.media_paths === 'string') {
        try {
          return { ...issue, media_paths: JSON.parse(issue.media_paths) };
        } catch (parseError) {
          console.error('Error parsing media_paths for issue ID:', issue.id, parseError);
          return { ...issue, media_paths: [] };
        }
      }
      return issue;
    });
    console.log('Returning issues to client:', issuesWithParsedMedia.length);
    res.json(issuesWithParsedMedia);
  } catch (error) {
    console.error('Fetch all issues error:', error);
    if (error && error.message) {
      console.error('Error message:', error.message);
    }
    if (error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Server error fetching all issues' });
  }
});

app.put('/api/issues/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
  const issueDbId = req.params.id;
  const rawStatus = req.body.status;

  console.log('--- STATUS UPDATE DEBUG ---');
  console.log('Issue ID:', issueDbId);
  console.log('Request Body:', JSON.stringify(req.body));
  console.log('Request Headers:', JSON.stringify(req.headers));
  console.log('Raw Status:', rawStatus);


  const status = (typeof rawStatus === 'string') ? rawStatus.trim().toUpperCase() : '';
  console.log('Normalized Status:', status);

  const allowedStatuses = ['OPEN', 'PENDING', 'RESOLVED', 'REJECTED'];
  if (!allowedStatuses.includes(status)) {
    console.error(`[ADMIN] Validation failed: "${status}" is not in [${allowedStatuses.join(', ')}]`);
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  try {
    const [issueRows] = await pool.execute('SELECT id, issue_id, status FROM issues WHERE id = ?', [issueDbId]);
    if (issueRows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    const currentIssue = issueRows[0];

    if (currentIssue.status.toUpperCase() === status) {
      return res.status(200).json({ message: 'Status already updated' });
    }

    const normalizedStatus = status.toUpperCase();
    const resolvedAt = normalizedStatus === 'RESOLVED' ? new Date() : null;
    await pool.execute(
      'UPDATE issues SET status = ?, resolved_at = ? WHERE id = ?',
      [normalizedStatus, resolvedAt, issueDbId]
    );

    const [updatedIssueRows] = await pool.execute(`
        SELECT
            i.id, i.issue_id, i.user_id, i.title, i.description, i.location,
            i.date_of_occurrence, i.media_paths, i.status, i.feedback, i.rating,
            i.created_at, i.resolved_at,
            u.full_name, u.phone_number, u.address, u.user_type, u.user_type_custom
        FROM issues i
        JOIN users u ON i.user_id = u.id
        WHERE i.id = ?
    `, [issueDbId]);

    const updatedIssue = updatedIssueRows[0];

    if (updatedIssue && typeof updatedIssue.media_paths === 'string') {
      try {
        updatedIssue.media_paths = JSON.parse(updatedIssue.media_paths);
      } catch (parseError) {
        console.error('Error parsing media_paths for updated issue (ID: ' + updatedIssue.id + '):', parseError);
        updatedIssue.media_paths = [];
      }
    }

    io.emit('status_updated', updatedIssue);
    res.json({ message: 'Issue status updated successfully', issue: updatedIssue });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ message: 'Server error updating issue status' });
  }
});

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});