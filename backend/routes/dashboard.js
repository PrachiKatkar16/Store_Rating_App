const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get dashboard stats (Admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
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

// Get store owner dashboard
router.get('/store-owner', authenticateToken, requireRole(['store_owner']), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store info and ratings
    const [storeData] = await db.execute(`
      SELECT s.id, s.name, s.address, 
             AVG(r.rating) as average_rating,
             COUNT(r.rating) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [userId]);

    // Get users who rated the store
    const [ratings] = await db.execute(`
      SELECT u.name, u.email, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json({
      store: storeData[0] || null,
      ratings: ratings
    });
  } catch (error) {
    console.error('Error fetching store owner dashboard:', error);
    res.status(500).json({ error: 'Server error while fetching dashboard data' });
  }
});

module.exports = router;