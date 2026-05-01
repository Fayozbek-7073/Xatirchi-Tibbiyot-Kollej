'use strict';

const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /faculties — both roles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, created_at, updated_at FROM faculties ORDER BY name'
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error('GET /faculties error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /faculties/:id — both roles
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const result = await pool.query(
      'SELECT id, name, created_at, updated_at FROM faculties WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Faculty not found' });
    return res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('GET /faculties/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /faculties — admin only
router.post('/', requireRole('admin'), async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await pool.query(
      'INSERT INTO faculties (name) VALUES ($1) RETURNING id, name, created_at, updated_at',
      [name.trim()]
    );
    return res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Faculty name already exists' });
    console.error('POST /faculties error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /faculties/:id — admin only
router.put('/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await pool.query(
      'UPDATE faculties SET name = $1 WHERE id = $2 RETURNING id, name, created_at, updated_at',
      [name.trim(), id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Faculty not found' });
    return res.json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Faculty name already exists' });
    console.error('PUT /faculties/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /faculties/:id — admin only
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const result = await pool.query('DELETE FROM faculties WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Faculty not found' });
    return res.json({ message: 'Faculty deleted' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete faculty with existing groups' });
    }
    console.error('DELETE /faculties/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
