import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Send message
router.post('/', [
  body('maisonId').isInt().withMessage('ID de maison invalide'),
  body('name').trim().isLength({ min: 2 }).withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Téléphone invalide'),
  body('message').trim().isLength({ min: 10 }).withMessage('Le message doit contenir au moins 10 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { maisonId, name, email, phone, message } = req.body;

    // Check if property exists
    const [properties] = await pool.execute(
      'SELECT id FROM maisons WHERE id = ?',
      [maisonId]
    );

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Propriété introuvable' });
    }

    const [result] = await pool.execute(`
      INSERT INTO messages (maisonId, name, email, phone, message, date)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [maisonId, name, email, phone, message]);

    res.status(201).json({
      id: result.insertId,
      maisonId,
      name,
      email,
      phone,
      message,
      date: new Date().toISOString()
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'envoi du message' });
  }
});

// Get received messages (owner only)
router.get('/received', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'owner') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const [messages] = await pool.execute(`
      SELECT m.*, ma.title as propertyTitle
      FROM messages m
      JOIN maisons ma ON m.maisonId = ma.id
      WHERE ma.ownerId = ?
      ORDER BY m.date DESC
    `, [req.user.id]);

    res.json(messages);
  } catch (error) {
    console.error('Get received messages error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get sent messages (tenant only - based on email)
router.get('/sent', authenticateToken, async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, ma.title as propertyTitle
      FROM messages m
      JOIN maisons ma ON m.maisonId = ma.id
      WHERE m.email = ?
      ORDER BY m.date DESC
    `, [req.user.email]);

    res.json(messages);
  } catch (error) {
    console.error('Get sent messages error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;