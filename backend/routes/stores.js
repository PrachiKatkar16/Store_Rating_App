const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all stores with ratings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT s.*, 
             AVG(r.rating) as average_rating,
             COUNT(r.rating) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const params = [];

    if (search) {
      query += ` WHERE s.name LIKE ? OR s.address LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY s.id ORDER BY ${sortBy} ${sortOrder}`;

    const [stores] = await db.execute(query, params);

    // Get user's rating for each store
    if (req.user.role === 'user') {
      for (let store of stores) {
        const [userRatings] = await db.execute(
          'SELECT rating FROM ratings WHERE store_id = ? AND user_id = ?',
          [store.id, req.user.id]
        );
        store.user_rating = userRatings[0]?.rating || null;
      }
    }

    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Server error while fetching stores' });
  }
});

// Add new store (Admin only)
router.post('/', 
  authenticateToken, 
  requireRole(['admin']),
  [
    body('name').isLength({ min: 1, max: 60 }).withMessage('Store name must be between 1-60 characters'),
    body('email').isEmail().withMessage('Must be a valid email'),
    body('address').isLength({ max: 400 }).withMessage('Address must not exceed 400 characters')
  ],
  async (req, res) => {
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
  }
);

module.exports = router;