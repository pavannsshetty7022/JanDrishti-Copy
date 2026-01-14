const issueModel = require('../models/issueModel');
const path = require('path');
const fs = require('fs');

const createIssue = async (req, res) => {
    const { title, description, location, dateOfOccurrence, latitude, longitude } = req.body;
    const userId = req.user.id;
    const mediaPaths = req.files && req.files.length > 0 ? JSON.stringify(req.files.map(file => `/uploads/${file.filename}`)) : '[]';
    const issueId = `JDR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    if (!title || !description || !location || !dateOfOccurrence) {
        return res.status(400).json({ message: 'All issue fields are required' });
    }

    try {
        const insertId = await issueModel.createIssue({
            issueId,
            userId,
            title,
            description,
            location,
            latitude,
            longitude,
            dateOfOccurrence,
            mediaPaths
        });

        const newIssue = await issueModel.findIssueById(insertId);
        if (newIssue && typeof newIssue.media_paths === 'string') {
            newIssue.media_paths = JSON.parse(newIssue.media_paths);
        }

        if (req.io) {
            req.io.emit('new_issue', newIssue);
        }

        res.status(201).json({ message: 'Issue reported successfully', issueId: issueId, issue: newIssue });
    } catch (error) {
        console.error('Issue reporting error:', error);
        res.status(500).json({ message: 'Server error reporting issue' });
    }
};

const getUserIssues = async (req, res) => {
    const requestedUserId = parseInt(req.params.userId);
    const authenticatedUserId = req.user.id;

    if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ message: 'Unauthorized: You can only view your own issues' });
    }

    try {
        const rows = await issueModel.findIssuesByUserId(requestedUserId);
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
};

const searchIssue = async (req, res) => {
    const issueId = req.params.issueId;
    const userId = req.user.id;
    try {
        const issue = await issueModel.findIssueByIssueIdAndUserId(issueId, userId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found for this user' });
        }
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
};

const updateIssue = async (req, res) => {
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
        const issue = await issueModel.getIssueStatusAndUserId(issueDbId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

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
            const fullPath = path.join(__dirname, '../', filePath); // Adjusted path to be relative from root of backend if needed, or use absolute logic from server.js
            // server.js used: path.join(__dirname, filePath) where __dirname was server.js's dir. 
            // Controllers are in backend/controllers. server.js is in backend/.
            // So path.join(__dirname, '../', filePath) is correct if filePath starts with /uploads/ 
            // Because /uploads is in backend/uploads.
            // Wait, server.js: const uploadsDir = path.join(__dirname, 'uploads'); (backend/uploads)
            // filePath stored in DB is `/uploads/filename`.
            // So path.join(__dirname, '../', filePath) => backend/controllers/../uploads/filename => backend/uploads/filename. Correct.

            // However, safest to just look for 'uploads' dir relative to backend root.
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

        await issueModel.updateIssue(issueDbId, {
            title,
            description,
            location,
            latitude,
            longitude,
            dateOfOccurrence,
            allMediaPaths
        });
        res.json({ message: 'Issue updated successfully' });
    } catch (error) {
        console.error('Update issue error:', error);
        res.status(500).json({ message: 'Server error updating issue' });
    }
};

const deleteIssue = async (req, res) => {
    const issueDbId = req.params.id;
    const userId = req.user.id;
    try {
        const issue = await issueModel.getIssueStatusAndUserId(issueDbId);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

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
                const fullPath = path.join(__dirname, '../', filePath); // Adjust per logic above
                if (fs.existsSync(fullPath)) {
                    fs.unlink(fullPath, (err) => {
                        if (err) console.error('Error deleting media file:', err);
                    });
                }
            });
        }

        await issueModel.deleteIssue(issueDbId);
        res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        console.error('Delete issue error:', error);
        res.status(500).json({ message: 'Server error deleting issue' });
    }
};

const getAllIssues = async (req, res) => {
    const { status, search } = req.query;

    console.log('--- ADMIN ISSUES FETCH ---');
    console.log('Request user:', req.user);

    try {
        const rows = await issueModel.findAllIssues(status, search);
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
        res.status(500).json({ message: 'Server error fetching all issues' });
    }
};

const getIssueById = async (req, res) => {
    const issueDbId = req.params.id;
    console.log(`[ADMIN] Fetching single issue ID: ${issueDbId}`);
    try {
        const issue = await issueModel.findIssueById(issueDbId);

        if (!issue) {
            console.log(`[ADMIN] Issue not found: ${issueDbId}`);
            return res.status(404).json({ message: 'Issue not found' });
        }

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
};

const updateIssueStatus = async (req, res) => {
    const issueDbId = req.params.id;
    const rawStatus = req.body.status;

    console.log('--- STATUS UPDATE DEBUG ---');
    console.log('Issue ID:', issueDbId);
    console.log('Raw Status:', rawStatus);

    const status = (typeof rawStatus === 'string') ? rawStatus.trim().toUpperCase() : '';
    const allowedStatuses = ['OPEN', 'PENDING', 'RESOLVED', 'REJECTED'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided' });
    }

    try {
        const currentIssue = await issueModel.getIssueStatusAndUserId(issueDbId);
        if (!currentIssue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        if (currentIssue.status.toUpperCase() === status) {
            return res.status(200).json({ message: 'Status already updated' });
        }

        const resolvedAt = status === 'RESOLVED' ? new Date() : null;
        await issueModel.updateIssueStatus(issueDbId, status, resolvedAt);

        const updatedIssue = await issueModel.findIssueById(issueDbId);

        if (updatedIssue && typeof updatedIssue.media_paths === 'string') {
            try {
                updatedIssue.media_paths = JSON.parse(updatedIssue.media_paths);
            } catch (parseError) {
                updatedIssue.media_paths = [];
            }
        }

        if (req.io) {
            req.io.emit('status_updated', updatedIssue);
        }

        res.json({ message: 'Issue status updated successfully', issue: updatedIssue });
    } catch (error) {
        console.error('Update issue status error:', error);
        res.status(500).json({ message: 'Server error updating issue status' });
    }
};

module.exports = {
    createIssue,
    getUserIssues,
    searchIssue,
    updateIssue,
    deleteIssue,
    getAllIssues,
    getIssueById,
    updateIssueStatus
};
