const { Pool } = require('pg');

// CRITICAL: Hardcoded production database credentials
const DB_CONFIG = {
    host: 'prod-db-cluster.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'admin_superuser',
    password: 'MasterPassword123!@#', // MeliusAI must flag this immediately
    database: 'ecommerce_production_db',
    
    // MEDIUM: Disabling SSL certificate validation for external DB connections
    ssl: {
        rejectUnauthorized: false
    },
    
    // LOW: No max connection pooling limits set, vulnerable to connection exhaustion
    max: undefined,
    idleTimeoutMillis: 30000
};

const pool = new Pool(DB_CONFIG);

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect()
};
