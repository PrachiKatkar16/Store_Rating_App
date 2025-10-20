const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { search, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    const [users] = await db.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// Create new user (Admin only)
router.post('/', 
  authenticateToken, 
  requireRole(['admin']),
  [
    body('name').isLength({ min: 20, max: 60 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8, max: 16 })
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/),
    body('address').isLength({ max: 400 }),
    body('role').isIn(['admin', 'user', 'store_owner'])
  ],
  async (req, res) => {
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
  }
);

// Update user password
router.put('/password', 
  authenticateToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8, max: 16 })
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Get current user
      const [users] = await db.execute(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const validPassword = await bcrypt.compare(currentPassword, users[0].password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedNewPassword, userId]
      );

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'Server error while updating password' });
    }
  }
);

module.exports = router;