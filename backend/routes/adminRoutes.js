const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const issueController = require('../controllers/issueController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');


router.get('/test-connectivity', adminController.testConnectivity);
router.post('/login', adminController.login);
router.post('/create', adminController.createAdmin);
router.get('/check', adminController.checkAdmins);
router.get('/get-single-issue/:id', authenticateToken, authorizeAdmin, issueController.getIssueById);

module.exports = router;
