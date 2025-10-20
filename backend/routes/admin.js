const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// All admin routes require admin role
router.use(authenticateToken, requireRole(['admin']));

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [storeCount] = await db.execute('SELECT COUNT(*) as count FROM stores');
    const [ratingCount] = await db.execute('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: userCount[0].count,
      totalStores: storeCount[0].count,
      totalRatings: ratingCount[0].count
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error while fetching dashboard stats' });
  }
});

// Get all users with filters
router.get('/users', async (req, res) => {
  try {
    const { search, role } = req.query;
    
    let query = `
      SELECT id, name, email, address, role, created_at 
      FROM users 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await db.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// Get all stores with ratings
router.get('/stores', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT s.*, 
             AVG(r.rating) as average_rating,
             COUNT(r.rating) as total_ratings,
             u.name as owner_name
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
    `;

    const params = [];

    if (search) {
      query += ` WHERE s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY s.id ORDER BY s.name`;

    const [stores] = await db.execute(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Server error while fetching stores' });
  }
});

// Create new user
router.post('/users', [
  body('name').isLength({ min: 20, max: 60 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
  body('address').isLength({ max: 400 }),
  body('role').isIn(['admin', 'user', 'store_owner'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role } = req.body;

    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      address,
      role
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error while creating user' });
  }
});

// Create new store
router.post('/stores', [
  body('name').isLength({ min: 1, max: 60 }),
  body('email').isEmail(),
  body('address').isLength({ max: 400 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, owner_id } = req.body;

    const [result] = await db.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );

    res.status(201).json({ 
      id: result.insertId, 
      name, 
      email, 
      address, 
      owner_id 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Store email already exists' });
    }
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Server error while creating store' });
  }
});

module.exports = router;