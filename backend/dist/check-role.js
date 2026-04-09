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
        const res = await client.query("SELECT role FROM users WHERE email = 'manager1@test.com'");
        console.log('ROLE:' + res.rows[0].role);
        await client.end();
    }
    catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}
check();
//# sourceMappingURL=check-role.js.map