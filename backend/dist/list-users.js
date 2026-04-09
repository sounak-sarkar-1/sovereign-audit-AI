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
        const res = await client.query('SELECT full_name, email, role FROM users');
        console.log('Users:', JSON.stringify(res.rows));
        await client.end();
    }
    catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}
check();
//# sourceMappingURL=list-users.js.map