"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function check() {
    const client = new pg_1.Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000,
    });
    try {
        console.log('Connecting with 5s timeout...');
        await client.connect();
        console.log('Connected to database');
        const res = await client.query('SELECT nspname FROM pg_catalog.pg_namespace');
        console.log('Schemas:', res.rows.map(r => r.nspname).join(', '));
        await client.end();
    }
    catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
}
check();
//# sourceMappingURL=check-db.js.map