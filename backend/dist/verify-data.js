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
        console.log('Connecting...');
        await client.connect();
        const tenants = await client.query('SELECT * FROM "global"."tenants"');
        console.log(JSON.stringify(tenants.rows, null, 2));
        await client.end();
    }
    catch (err) {
        console.error('Error:', err.message);
    }
}
check();
//# sourceMappingURL=verify-data.js.map