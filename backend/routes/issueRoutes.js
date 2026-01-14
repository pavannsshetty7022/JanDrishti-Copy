const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/', authenticateToken, upload.array('media', 10), issueController.createIssue);
router.get('/user/:userId', authenticateToken, issueController.getUserIssues);
router.get('/search/:issueId', authenticateToken, issueController.searchIssue);
router.put('/:id', authenticateToken, upload.fields([{ name: 'newMedia', maxCount: 10 }, { name: 'existingMedia', maxCount: 20 }]), issueController.updateIssue);
router.delete('/:id', authenticateToken, issueController.deleteIssue);

router.get('/', authenticateToken, authorizeAdmin, issueController.getAllIssues);
router.put('/:id/status', authenticateToken, authorizeAdmin, issueController.updateIssueStatus);


module.exports = router;
