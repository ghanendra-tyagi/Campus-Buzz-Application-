const pool = require('../config/database');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM events WHERE published = true';
    let params = [];
    let paramCount = 0;

    if (category && category !== 'all') {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    
    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single event
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create event (Admin only)
const createEvent = async (req, res) => {
  try {
    const {
      title, description, category, date, startTime, endTime, venue,
      price, maxParticipants, contactEmail, contactPhone, published, featuredEvent
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events (title, description, category, date, start_time, end_time, venue, price, max_participants, 
       contact_email, contact_phone, published, featured_event, created_by, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()) 
       RETURNING *`,
      [title, description, category, date, startTime, endTime, venue, price, maxParticipants, 
       contactEmail, contactPhone, published, featuredEvent, req.user.userId]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Submit feedback
const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    // Check if user attended the event
    const registration = await pool.query(
      'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2 AND status = $3',
      [id, userId, 'confirmed']
    );

    if (registration.rows.length === 0) {
      return res.status(400).json({ error: 'You must be registered for this event to leave feedback' });
    }

    // Insert feedback
    const result = await pool.query(
      `INSERT INTO feedback (event_id, user_id, rating, comment, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [id, userId, rating, comment]
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAllEvents, getEventById, createEvent, submitFeedback };
