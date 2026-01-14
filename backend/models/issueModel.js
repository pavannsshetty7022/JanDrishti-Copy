const { pool } = require('../config/db');

const createIssue = async (issueData) => {
    const { issueId, userId, title, description, location, latitude, longitude, dateOfOccurrence, mediaPaths } = issueData;
    const [result] = await pool.execute(
        'INSERT INTO issues (issue_id, user_id, title, description, location, latitude, longitude, date_of_occurrence, media_paths, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [issueId, userId, title, description, location, latitude || null, longitude || null, dateOfOccurrence, mediaPaths, 'OPEN']
    );
    return result.insertId;
};

const findIssueById = async (id) => {
    const [rows] = await pool.execute(`
      SELECT
          i.id, i.issue_id, i.user_id, i.title, i.description, i.location,
          i.date_of_occurrence, i.media_paths, i.status, i.feedback, i.rating,
          i.created_at, i.resolved_at,
          u.full_name, u.phone_number, u.address, u.user_type, u.user_type_custom
      FROM issues i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `, [id]);
    return rows[0];
};

const findIssuesByUserId = async (userId) => {
    const [rows] = await pool.execute('SELECT * FROM issues WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
};

const findIssueByIssueIdAndUserId = async (issueId, userId) => {
    const [rows] = await pool.execute('SELECT * FROM issues WHERE issue_id = ? AND user_id = ?', [issueId, userId]);
    return rows[0];
};

const updateIssue = async (id, issueData) => {
    const { title, description, location, latitude, longitude, dateOfOccurrence, allMediaPaths } = issueData;
    await pool.execute(
        'UPDATE issues SET title = ?, description = ?, location = ?, latitude = ?, longitude = ?, date_of_occurrence = ?, media_paths = ? WHERE id = ?',
        [title, description, location, latitude || null, longitude || null, dateOfOccurrence, allMediaPaths, id]
    );
};

const deleteIssue = async (id) => {
    await pool.execute('DELETE FROM issues WHERE id = ?', [id]);
};

/* Admin queries */

const findAllIssues = async (status, search) => {
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

    const [rows] = await pool.execute(query, params);
    return rows;
};

const updateIssueStatus = async (id, status, resolvedAt) => {
    await pool.execute(
        'UPDATE issues SET status = ?, resolved_at = ? WHERE id = ?',
        [status, resolvedAt, id]
    );
};

// Helper to get status only
const getIssueStatusAndUserId = async (id) => {
    const [issueRows] = await pool.execute('SELECT id, issue_id, status, user_id, media_paths FROM issues WHERE id = ?', [id]);
    return issueRows[0];
}

module.exports = {
    createIssue,
    findIssueById,
    findIssuesByUserId,
    findIssueByIssueIdAndUserId,
    updateIssue,
    deleteIssue,
    findAllIssues,
    updateIssueStatus,
    getIssueStatusAndUserId
};
