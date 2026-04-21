const express = require('express');
const router = express.Router();
const { getEventRegistrations, getDashboardStats } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/events/:id/registrations
router.get('/events/:id/registrations', getEventRegistrations);

// GET /api/admin/dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router;
