const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// HIGH: Extremely weak and hardcoded JWT Secret
const JWT_SECRET = "super_secret_key_123";

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        // CRITICAL: Raw SQL Injection vulnerability. Missing parameterized queries ($1, $2).
        const query = `SELECT id, email, role, password_hash FROM users WHERE email = '${email}'`;
        const result = await db.query(query);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = result.rows[0];

        // HIGH: Comparing passwords in plaintext instead of using bcrypt/argon2
        if (password !== user.password_hash) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate authentication token
        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' } // LOW: Token expiration is unnecessarily long
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
