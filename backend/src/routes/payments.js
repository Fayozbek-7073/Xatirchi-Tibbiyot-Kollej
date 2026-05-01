'use strict';

const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(authenticate);

// POST /students/:id/payment — admin only
// Adds a payment, auto-recalculates contract_paid and debt
router.post('/:id/payment', requireRole('admin'), async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  if (isNaN(studentId)) return res.status(400).json({ error: 'Invalid student id' });

  const amount = parseFloat(req.body.amount);
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  const note = req.body.note ? String(req.body.note).trim() : null;
  const createdBy = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the student row
    const studentResult = await client.query(
      'SELECT id, contract_total, contract_paid FROM students WHERE id = $1 FOR UPDATE',
      [studentId]
    );
    if (studentResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentResult.rows[0];
    const newPaid = parseFloat(student.contract_paid) + amount;

    if (newPaid > parseFloat(student.contract_total)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Payment exceeds remaining contract amount',
        remaining: parseFloat(student.contract_total) - parseFloat(student.contract_paid),
      });
    }

    // Record the payment
    await client.query(
      'INSERT INTO payments (student_id, amount, note, created_by) VALUES ($1, $2, $3, $4)',
      [studentId, amount, note, createdBy]
    );

    // Update contract_paid (debt is auto-computed via generated column)
    const updated = await client.query(
      `UPDATE students SET contract_paid = $1
       WHERE id = $2
       RETURNING id, full_name, contract_total, contract_paid, debt`,
      [newPaid, studentId]
    );

    await client.query('COMMIT');

    return res.status(201).json({ data: updated.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /students/:id/payment error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /students/:id/payments — both roles — payment history for a student
router.get('/:id/payments', async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  if (isNaN(studentId)) return res.status(400).json({ error: 'Invalid student id' });

  try {
    const result = await pool.query(
      `SELECT p.id, p.amount, p.note, p.created_at,
              u.username AS created_by_username
       FROM payments p
       JOIN users u ON u.id = p.created_by
       WHERE p.student_id = $1
       ORDER BY p.created_at DESC`,
      [studentId]
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error('GET /students/:id/payments error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
