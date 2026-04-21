const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'campus_buzz',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Campus Buzz API is running' });
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, department, year, studentId, adminId } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role, department, year, student_id, admin_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
       RETURNING id, first_name, last_name, email, phone, role, department, year, student_id, admin_id`,
      [firstName, lastName, email, hashedPassword, phone, role, department, year, studentId, adminId]
    );

    const user = result.rows[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        year: user.year,
        studentId: user.student_id,
        adminId: user.admin_id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        year: user.year,
        studentId: user.student_id,
        adminId: user.admin_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all events
app.get('/api/events', async (req, res) => {
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
});

// Get single event
app.get('/api/events/:id', async (req, res) => {
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
});

// Create event (Admin only)
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

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
});

// Register for event
app.post('/api/events/:id/register', authenticateToken, async (req, res) => {
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
});

// Get user registrations
app.get('/api/user/registrations', authenticateToken, async (req, res) => {
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
});

// Submit feedback
app.post('/api/events/:id/feedback', authenticateToken, async (req, res) => {
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
});

// Admin: Get all registrations for an event
app.get('/api/admin/events/:id/registrations', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, u.email, u.phone, u.student_id
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get dashboard stats
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get total events
    const eventsResult = await pool.query('SELECT COUNT(*) FROM events');
    const totalEvents = parseInt(eventsResult.rows[0].count);

    // Get total registrations
    const registrationsResult = await pool.query('SELECT COUNT(*) FROM registrations');
    const totalRegistrations = parseInt(registrationsResult.rows[0].count);

    // Get total revenue
    const revenueResult = await pool.query('SELECT COALESCE(SUM(total_amount), 0) FROM registrations WHERE status = $1', ['confirmed']);
    const totalRevenue = parseFloat(revenueResult.rows[0].coalesce);

    // Get upcoming events
    const upcomingResult = await pool.query('SELECT COUNT(*) FROM events WHERE date >= CURRENT_DATE');
    const upcomingEvents = parseInt(upcomingResult.rows[0].count);

    res.json({
      totalEvents,
      totalRegistrations,
      totalRevenue,
      upcomingEvents
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
});