'use strict';

const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(authenticate);

// GET /groups — both roles; optional ?faculty_id=&course=
router.get('/', async (req, res) => {
  const conditions = [];
  const params = [];

  if (req.query.faculty_id) {
    const fid = parseInt(req.query.faculty_id, 10);
    if (isNaN(fid)) return res.status(400).json({ error: 'Invalid faculty_id' });
    params.push(fid);
    conditions.push(`g.faculty_id = $${params.length}`);
  }

  if (req.query.course) {
    const course = parseInt(req.query.course, 10);
    if (isNaN(course) || course < 1 || course > 4)
      return res.status(400).json({ error: 'course must be 1–4' });
    params.push(course);
    conditions.push(`g.course = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT g.id, g.name, g.course, g.faculty_id, f.name AS faculty_name,
              g.created_at, g.updated_at
       FROM groups g
       JOIN faculties f ON f.id = g.faculty_id
       ${where}
       ORDER BY f.name, g.course, g.name`,
      params
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error('GET /groups error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /groups/:id — both roles
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const result = await pool.query(
      `SELECT g.id, g.name, g.course, g.faculty_id, f.name AS faculty_name,
              g.created_at, g.updated_at
       FROM groups g
       JOIN faculties f ON f.id = g.faculty_id
       WHERE g.id = $1`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Group not found' });
    return res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('GET /groups/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /groups — admin only
router.post('/', requireRole('admin'), async (req, res) => {
  const { name, faculty_id, course } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  if (!faculty_id) return res.status(400).json({ error: 'faculty_id is required' });
  if (!course || course < 1 || course > 4)
    return res.status(400).json({ error: 'course must be 1–4' });

  try {
    const result = await pool.query(
      `INSERT INTO groups (name, faculty_id, course)
       VALUES ($1, $2, $3)
       RETURNING id, name, faculty_id, course, created_at, updated_at`,
      [name.trim(), faculty_id, course]
    );
    return res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Faculty not found' });
    if (err.code === '23505') return res.status(409).json({ error: 'Group already exists in this faculty' });
    console.error('POST /groups error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /groups/:id — admin only
router.put('/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const { name, faculty_id, course } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  if (!faculty_id) return res.status(400).json({ error: 'faculty_id is required' });
  if (!course || course < 1 || course > 4)
    return res.status(400).json({ error: 'course must be 1–4' });

  try {
    const result = await pool.query(
      `UPDATE groups SET name = $1, faculty_id = $2, course = $3
       WHERE id = $4
       RETURNING id, name, faculty_id, course, created_at, updated_at`,
      [name.trim(), faculty_id, course, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Group not found' });
    return res.json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Faculty not found' });
    if (err.code === '23505') return res.status(409).json({ error: 'Group already exists in this faculty' });
    console.error('PUT /groups/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /groups/:id — admin only
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const result = await pool.query('DELETE FROM groups WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Group not found' });
    return res.json({ message: 'Group deleted' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Cannot delete group with enrolled students' });
    }
    console.error('DELETE /groups/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
