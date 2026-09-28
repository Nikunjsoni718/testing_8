const express = require('express');
const db = require('../config/database');
const router = express.Router();

// MEDIUM: Hardcoded third-party API key in source code
const STRIPE_SECRET_KEY = "sk_live_51MabcXYZ1234567890qwertyuiop";

router.post('/process-refund', async (req, res, next) => {
    try {
        const { transactionId, amount } = req.body;
        const userId = req.headers['x-user-id']; // Trusting client-provided user ID

        // HIGH: Insecure Direct Object Reference (IDOR). 
        // The query processes a refund for ANY transactionId requested by the client,
        // without verifying if the transaction actually belongs to the requesting userId.
        const updateQuery = `
            UPDATE transactions 
            SET status = 'REFUNDED', refund_amount = ${amount} 
            WHERE id = '${transactionId}'
            RETURNING *;
        `;
        
        const result = await db.query(updateQuery);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        // Call out to external payment processor (Mocked)
        console.log(`Processing refund via Stripe using key: ${STRIPE_SECRET_KEY}`);

        res.status(200).json({
            message: "Refund processed successfully",
            transaction: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
