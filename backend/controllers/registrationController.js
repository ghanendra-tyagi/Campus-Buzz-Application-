const pool = require('../config/database');

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.user.userId;

    // Check if event exists and has capacity
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];
    
    // Check current registrations
    const registrationCount = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) as total FROM registrations WHERE event_id = $1 AND status = $2',
      [id, 'confirmed']
    );
    
    const currentRegistrations = parseInt(registrationCount.rows[0].total);
    
    if (currentRegistrations + quantity > event.max_participants) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    // Check if user already registered
    const existingRegistration = await pool.query(
      'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingRegistration.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Create registration
    const totalAmount = event.price * quantity;
    const registrationResult = await pool.query(
      `INSERT INTO registrations (event_id, user_id, quantity, total_amount, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [id, userId, quantity, totalAmount, 'confirmed']
    );

    res.status(201).json({
      message: 'Registration successful',
      registration: registrationResult.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user registrations
const getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(
      `SELECT r.*, e.title, e.description, e.category, e.date, e.start_time, e.end_time, 
       e.venue, e.price, e.contact_email, e.contact_phone
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { registerForEvent, getUserRegistrations };
