'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const facultiesRouter = require('./routes/faculties');
const groupsRouter = require('./routes/groups');
const studentsRouter = require('./routes/students');
const { router: paymentsRouter, topRouter: paymentsTopRouter } = require('./routes/payments');

const app = express();

// CORS — restrict to explicit whitelist from env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no Origin header (curl, server-to-server, health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/auth', authRouter);
app.use('/faculties', facultiesRouter);
app.use('/groups', groupsRouter);
app.use('/students', studentsRouter);

// Nested payment routes: POST /students/:id/payment, GET /students/:id/payments
app.use('/students', paymentsRouter);
// Top-level payment listing: GET /payments
app.use('/payments', paymentsTopRouter);

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
