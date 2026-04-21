const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent, submitFeedback } = require('../controllers/eventController');
const { registerForEvent, getUserRegistrations } = require('../controllers/registrationController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

// Public routes
// GET /api/events
router.get('/', getAllEvents);

// GET /api/events/:id
router.get('/:id', getEventById);

// Protected routes
// POST /api/events - Create event (Admin only)
router.post('/', authenticateToken, requireAdmin, createEvent);

// POST /api/events/:id/register - Register for event
router.post('/:id/register', authenticateToken, registerForEvent);

// POST /api/events/:id/feedback - Submit feedback
router.post('/:id/feedback', authenticateToken, submitFeedback);

module.exports = router;
