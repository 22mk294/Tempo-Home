import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all properties
router.get('/', async (req, res) => {
  try {
    const [properties] = await pool.execute(`
      SELECT m.*, u.name as ownerName 
      FROM maisons m 
      JOIN users u ON m.ownerId = u.id 
      WHERE m.available = true 
      ORDER BY m.createdAt DESC
    `);

    // Parse images JSON
    const formattedProperties = properties.map(property => ({
      ...property,
      images: property.images ? JSON.parse(property.images) : []
    }));

    res.json(formattedProperties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [properties] = await pool.execute(`
      SELECT m.*, u.name as ownerName, u.email as ownerEmail, u.phone as ownerPhone
      FROM maisons m 
      JOIN users u ON m.ownerId = u.id 
      WHERE m.id = ?
    `, [id]);

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Propriété introuvable' });
    }

    const property = properties[0];
    property.images = property.images ? JSON.parse(property.images) : [];

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get my properties (owner only)
router.get('/my-properties', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'owner') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const [properties] = await pool.execute(
      'SELECT * FROM maisons WHERE ownerId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );

    const formattedProperties = properties.map(property => ({
      ...property,
      images: property.images ? JSON.parse(property.images) : []
    }));

    res.json(formattedProperties);
  } catch (error) {
    console.error('Get my properties error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get stats (owner only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'owner') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const [propertiesCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM maisons WHERE ownerId = ?',
      [req.user.id]
    );

    const [messagesCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM messages m JOIN maisons ma ON m.maisonId = ma.id WHERE ma.ownerId = ?',
      [req.user.id]
    );

    res.json({
      totalProperties: propertiesCount[0].count,
      totalMessages: messagesCount[0].count,
      totalViews: Math.floor(Math.random() * 1000) // Placeholder for views
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Create property (owner only)
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 5 }).withMessage('Le titre doit contenir au moins 5 caractères'),
  body('description').trim().isLength({ min: 20 }).withMessage('La description doit contenir au moins 20 caractères'),
  body('price').isNumeric().withMessage('Le prix doit être un nombre'),
  body('location').trim().isLength({ min: 3 }).withMessage('La localisation est requise'),
  body('nbRooms').isInt({ min: 1 }).withMessage('Le nombre de pièces doit être un entier positif'),
  body('surface').isNumeric().withMessage('La superficie doit être un nombre')
], async (req, res) => {
  try {
    if (req.user.type !== 'owner') {
      return res.status(403).json({ error: 'Seuls les propriétaires peuvent créer des annonces' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, location, nbRooms, surface, images = [] } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO maisons (title, description, price, location, nbRooms, surface, images, ownerId, available, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, NOW())
    `, [title, description, price, location, nbRooms, surface, JSON.stringify(images), req.user.id]);

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      price,
      location,
      nbRooms,
      surface,
      images,
      ownerId: req.user.id,
      available: true
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création' });
  }
});

// Update property (owner only)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 5 }).withMessage('Le titre doit contenir au moins 5 caractères'),
  body('description').optional().trim().isLength({ min: 20 }).withMessage('La description doit contenir au moins 20 caractères'),
  body('price').optional().isNumeric().withMessage('Le prix doit être un nombre'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('La localisation est requise'),
  body('nbRooms').optional().isInt({ min: 1 }).withMessage('Le nombre de pièces doit être un entier positif'),
  body('surface').optional().isNumeric().withMessage('La superficie doit être un nombre')
], async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if property exists and belongs to user
    const [properties] = await pool.execute(
      'SELECT * FROM maisons WHERE id = ? AND ownerId = ?',
      [id, req.user.id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Propriété introuvable ou accès refusé' });
    }

    const { title, description, price, location, nbRooms, surface, images, available } = req.body;

    await pool.execute(`
      UPDATE maisons 
      SET title = ?, description = ?, price = ?, location = ?, nbRooms = ?, surface = ?, images = ?, available = ?
      WHERE id = ? AND ownerId = ?
    `, [title, description, price, location, nbRooms, surface, JSON.stringify(images), available, id, req.user.id]);

    res.json({ message: 'Propriété mise à jour avec succès' });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
  }
});

// Delete property (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists and belongs to user
    const [properties] = await pool.execute(
      'SELECT * FROM maisons WHERE id = ? AND ownerId = ?',
      [id, req.user.id]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Propriété introuvable ou accès refusé' });
    }

    await pool.execute('DELETE FROM maisons WHERE id = ? AND ownerId = ?', [id, req.user.id]);

    res.json({ message: 'Propriété supprimée avec succès' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  }
});

export default router;