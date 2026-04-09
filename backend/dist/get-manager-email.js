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
        const res = await client.query("SELECT email FROM users WHERE full_name = 'Manager One' LIMIT 1");
        if (res.rows.length > 0) {
            console.log('EMAIL:' + res.rows[0].email);
        }
        else {
            const res2 = await client.query("SELECT email FROM users WHERE role = 'manager' LIMIT 1");
            if (res2.rows.length > 0) {
                console.log('EMAIL:' + res2.rows[0].email);
            }
        }
        await client.end();
    }
    catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}
check();
//# sourceMappingURL=get-manager-email.js.map