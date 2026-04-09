"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function check() {
    const client = new pg_1.Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        console.log('Connected to database');
        const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'notifications'");
        console.log('Notifications table locations:', JSON.stringify(res.rows));
        const sp = await client.query('SHOW search_path');
        console.log('Default search_path:', JSON.stringify(sp.rows));
        await client.end();
    }
    catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}
check();
//# sourceMappingURL=check-tables.js.map