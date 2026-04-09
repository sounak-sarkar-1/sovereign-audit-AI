"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function reset() {
    const client = new pg_1.Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    const newHash = await bcrypt.hash('TemporaryPassword123!', 12);
    await client.query('UPDATE "users" SET "password_hash" = $1 WHERE "email" = $2', [newHash, 'admin@sovereign.ai']);
    console.log('Password reset successfully for admin@sovereign.ai');
    await client.end();
}
reset();
//# sourceMappingURL=reset-pwd.js.map