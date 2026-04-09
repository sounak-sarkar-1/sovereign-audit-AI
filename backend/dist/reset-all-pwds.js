"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function resetAll() {
    const client = new pg_1.Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    const newHash = await bcrypt.hash('TemporaryPassword123!', 12);
    await client.query('UPDATE "users" SET "password_hash" = $1', [newHash]);
    console.log('All user passwords reset successfully');
    await client.end();
}
resetAll();
//# sourceMappingURL=reset-all-pwds.js.map