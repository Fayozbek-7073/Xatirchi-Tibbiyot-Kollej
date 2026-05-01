'use strict';

const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(authenticate);

// GET /students — both roles
// Query params: ?group_id=  ?faculty_id=  ?search=  ?page=  ?limit=
router.get('/', async (req, res) => {
  const conditions = [];
  const params = [];

  if (req.query.group_id) {
    const gid = parseInt(req.query.group_id, 10);
    if (isNaN(gid)) return res.status(400).json({ error: 'Invalid group_id' });
    params.push(gid);
    conditions.push(`s.group_id = $${params.length}`);
  }

  if (req.query.faculty_id) {
    const fid = parseInt(req.query.faculty_id, 10);
    if (isNaN(fid)) return res.status(400).json({ error: 'Invalid faculty_id' });
    params.push(fid);
    conditions.push(`g.faculty_id = $${params.length}`);
  }

  if (req.query.search) {
    params.push(`%${req.query.search.trim()}%`);
    conditions.push(`s.full_name ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const offset = (page - 1) * limit;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM students s
       JOIN groups g ON g.id = s.group_id
       ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit);
    params.push(offset);

    const result = await pool.query(
      `SELECT s.id, s.full_name, s.group_id, g.name AS group_name,
              g.course, g.faculty_id, f.name AS faculty_name,
              s.contract_total, s.contract_paid, s.debt,
              s.created_at, s.updated_at
       FROM students s
       JOIN groups g ON g.id = s.group_id
       JOIN faculties f ON f.id = g.faculty_id
       ${where}
       ORDER BY f.name, g.name, s.full_name
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return res.json({
      data: result.rows,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /students error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /students/:id — both roles
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const result = await pool.query(
      `SELECT s.id, s.full_name, s.group_id, g.name AS group_name,
              g.course, g.faculty_id, f.name AS faculty_name,
              s.contract_total, s.contract_paid, s.debt,
              s.created_at, s.updated_at
       FROM students s
       JOIN groups g ON g.id = s.group_id
       JOIN faculties f ON f.id = g.faculty_id
       WHERE s.id = $1`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
    return res.json({ data: result.rows[0] });
  } catch (err) {
    console.error('GET /students/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /students — admin only
router.post('/', requireRole('admin'), async (req, res) => {
  const { full_name, group_id, contract_total } = req.body;

  if (!full_name || !full_name.trim()) return res.status(400).json({ error: 'full_name is required' });
  if (!group_id) return res.status(400).json({ error: 'group_id is required' });
  const total = parseFloat(contract_total);
  if (isNaN(total) || total < 0) return res.status(400).json({ error: 'contract_total must be a non-negative number' });

  try {
    const result = await pool.query(
      `INSERT INTO students (full_name, group_id, contract_total, contract_paid)
       VALUES ($1, $2, $3, 0)
       RETURNING id, full_name, group_id, contract_total, contract_paid, debt, created_at, updated_at`,
      [full_name.trim(), group_id, total]
    );
    return res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Group not found' });
    console.error('POST /students error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /students/:id — admin only
router.put('/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const { full_name, group_id, contract_total } = req.body;

  if (!full_name || !full_name.trim()) return res.status(400).json({ error: 'full_name is required' });
  if (!group_id) return res.status(400).json({ error: 'group_id is required' });
  const total = parseFloat(contract_total);
  if (isNaN(total) || total < 0) return res.status(400).json({ error: 'contract_total must be a non-negative number' });

  try {
    const result = await pool.query(
      `UPDATE students SET full_name = $1, group_id = $2, contract_total = $3
       WHERE id = $4
       RETURNING id, full_name, group_id, contract_total, contract_paid, debt, created_at, updated_at`,
      [full_name.trim(), group_id, total, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
    return res.json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Group not found' });
    console.error('PUT /students/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /students/:id — admin only
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Student not found' });
    return res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error('DELETE /students/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
