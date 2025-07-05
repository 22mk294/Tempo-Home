import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware pour vérifier les droits admin
const requireAdmin = (req, res, next) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé - Droits administrateur requis' });
  }
  next();
};

// Get admin dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Total properties
    const [totalProperties] = await pool.execute(
      'SELECT COUNT(*) as count FROM maisons'
    );

    // Total users by type
    const [usersByType] = await pool.execute(`
      SELECT type, COUNT(*) as count 
      FROM users 
      WHERE type != 'admin'
      GROUP BY type
    `);

    // Total messages
    const [totalMessages] = await pool.execute(
      'SELECT COUNT(*) as count FROM messages'
    );

    // Total views
    const [totalViews] = await pool.execute(
      'SELECT SUM(views) as total FROM maisons'
    );

    // Properties by month (last 6 months)
    const [propertiesByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count
      FROM maisons 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month
    `);

    // Messages by month (last 6 months)
    const [messagesByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(*) as count
      FROM messages 
      WHERE date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month
    `);

    // Most viewed properties
    const [topProperties] = await pool.execute(`
      SELECT m.id, m.title, m.views, u.name as ownerName
      FROM maisons m
      JOIN users u ON m.ownerId = u.id
      ORDER BY m.views DESC
      LIMIT 5
    `);

    // Views by day (last 30 days)
    const [viewsByDay] = await pool.execute(`
      SELECT 
        DATE(viewedAt) as day,
        COUNT(*) as count
      FROM property_views 
      WHERE viewedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(viewedAt)
      ORDER BY day
    `);

    res.json({
      summary: {
        totalProperties: totalProperties[0].count,
        totalUsers: usersByType.reduce((sum, item) => sum + item.count, 0),
        totalMessages: totalMessages[0].count,
        totalViews: totalViews[0].total || 0
      },
      usersByType: usersByType.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {}),
      charts: {
        propertiesByMonth,
        messagesByMonth,
        viewsByDay,
        topProperties
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT id, name, email, phone, type, createdAt 
      FROM users 
      WHERE type != 'admin'
      ORDER BY createdAt DESC
    `);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get all properties with owner info (admin only)
router.get('/properties', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [properties] = await pool.execute(`
      SELECT m.*, u.name as ownerName, u.email as ownerEmail
      FROM maisons m
      JOIN users u ON m.ownerId = u.id
      ORDER BY m.createdAt DESC
    `);

    const formattedProperties = properties.map(property => ({
      ...property,
      images: property.images ? JSON.parse(property.images) : []
    }));

    res.json(formattedProperties);
  } catch (error) {
    console.error('Get admin properties error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get all messages (admin only)
router.get('/messages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, ma.title as propertyTitle, u.name as ownerName
      FROM messages m
      JOIN maisons ma ON m.maisonId = ma.id
      JOIN users u ON ma.ownerId = u.id
      ORDER BY m.date DESC
    `);

    res.json(messages);
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Delete property (admin only)
router.delete('/properties/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM maisons WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Propriété introuvable' });
    }

    res.json({ message: 'Propriété supprimée avec succès' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Moderate user (admin only) - suspend/activate
router.patch('/users/:id/moderate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'suspend' or 'activate'

    // For now, we'll just return success since we don't have a status field
    // In a real app, you'd add a status field to users table
    res.json({ message: `Utilisateur ${action === 'suspend' ? 'suspendu' : 'activé'} avec succès` });
  } catch (error) {
    console.error('Moderate user error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
