const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Submit or update rating
router.post('/', 
  authenticateToken,
  requireRole(['user']),
  [
    body('store_id').isInt({ min: 1 }),
    body('rating').isInt({ min: 1, max: 5 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { store_id, rating } = req.body;
      const user_id = req.user.id;

      // Check if rating already exists
      const [existingRatings] = await db.execute(
        'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
        [user_id, store_id]
      );

      if (existingRatings.length > 0) {
        // Update existing rating
        await db.execute(
          'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND store_id = ?',
          [rating, user_id, store_id]
        );
        res.json({ message: 'Rating updated successfully' });
      } else {
        // Create new rating
        await db.execute(
          'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
          [user_id, store_id, rating]
        );
        res.status(201).json({ message: 'Rating submitted successfully' });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      res.status(500).json({ error: 'Server error while submitting rating' });
    }
  }
);

module.exports = router;