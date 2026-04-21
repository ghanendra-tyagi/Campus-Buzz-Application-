const pool = require('../config/database');

// Get all registrations for an event
const getEventRegistrations = async (req, res) => {
  try {
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
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
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
};

module.exports = { getEventRegistrations, getDashboardStats };
