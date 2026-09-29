const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Added bcrypt for secure comparison
const db = require('../config/database');
const router = express.Router();

// FIXED: Moved to environment variable fallback
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        // FIXED: Using parameterized queries ($1) to prevent SQL Injection
        const query = `SELECT id, email, role, password_hash FROM users WHERE email = $1`;
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];

        // FIXED: Using bcrypt.compare instead of plaintext comparison
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
