'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const facultiesRouter = require('./routes/faculties');
const groupsRouter = require('./routes/groups');
const studentsRouter = require('./routes/students');
const paymentsRouter = require('./routes/payments');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/auth', authRouter);
app.use('/faculties', facultiesRouter);
app.use('/groups', groupsRouter);
app.use('/students', studentsRouter);

// Payment routes are nested under /students/:id/payment(s)
app.use('/students', paymentsRouter);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  console.log(`Xatirchi-tibbiyot backend running on port ${PORT}`);
});

module.exports = app;
