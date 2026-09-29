const express = require('express');
const cors = require('cors');

const authRoutes = require('./controllers/auth.controller');
const billingRoutes = require('./services/billing.service');

const app = express();

// 1. Hardened CORS Configuration (Replaces wildcard '*')
const allowedOrigins = [
  process.env.CLIENT_URL || 'https://meliusai.in',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl) or matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy: Origin not allowed.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Request body parsing with payload limits to prevent DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 3. Mount Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);

// 4. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// 5. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 6. Centralized Sanitized Error Handler (Prevents stack trace / path disclosure)
app.use((err, req, res, next) => {
  // Log full runtime diagnostics internally
  console.error(`[Internal Error] ${err.message}`, {
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    path: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || err.status || 500;
  const isClientSafe = statusCode < 500;

  // Never leak raw exception objects, stack traces, or internal paths to the client
  res.status(statusCode).json({
    error: isClientSafe ? err.message : 'An internal server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = app;
