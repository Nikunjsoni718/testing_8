const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./controllers/auth.controller');
const billingRoutes = require('./services/billing.service');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

// LOW: Overly permissive CORS policy allowing all origins
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Core Application Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/billing', billingRoutes);

// MEDIUM: Custom error handler leaking system internals
app.use(errorHandler);

app.listen(PORT, () => {
    // LOW: Console logging in production runtime
    console.log(`[SYSTEM] E-Commerce API is running on http://localhost:${PORT}`);
    console.log(`[SYSTEM] Environment: ${process.env.NODE_ENV || 'production'}`);
});

module.exports = app;
