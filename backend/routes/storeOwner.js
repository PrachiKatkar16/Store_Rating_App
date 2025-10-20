const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// All store owner routes require store_owner role
router.use(authenticateToken, requireRole(['store_owner']));

// Get store owner dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store info and ratings for the store owned by this user
    const [storeData] = await db.execute(`
      SELECT s.*, 
             AVG(r.rating) as average_rating,
             COUNT(r.rating) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [userId]);

    if (storeData.length === 0) {
      return res.json({
        store: null,
        ratings: []
      });
    }

    const store = storeData[0];

    // Get users who have rated the store
    const [ratings] = await db.execute(`
      SELECT 
        u.name as user_name,
        u.email as user_email,
        r.rating,
        r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [store.id]);

    res.json({
      store: store,
      ratings: ratings
    });
  } catch (error) {
    console.error('Error fetching store owner dashboard:', error);
    res.status(500).json({ error: 'Server error while fetching dashboard data' });
  }
});

module.exports = router;