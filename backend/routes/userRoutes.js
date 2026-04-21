const express = require('express');
const router = express.Router();
const { getUserRegistrations } = require('../controllers/registrationController');
const { authenticateToken } = require('../middlewares/auth');

// GET /api/user/registrations
router.get('/registrations', authenticateToken, getUserRegistrations);

module.exports = router;
