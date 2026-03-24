"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
async function checkDb() {
    const client = new pg_1.Client({
        connectionString: 'postgresql://postgres:electrical@localhost:5432/sovereign_audit',
    });
    try {
        await client.connect();
        const res = await client.query(`
      SELECT table_schema, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'line_item_responses'
    `);
        console.log('Columns in line_item_responses:');
        console.log(res.rows);
    }
    catch (err) {
        console.error('Error connecting to DB:', err);
    }
    finally {
        await client.end();
    }
}
checkDb();
//# sourceMappingURL=check-db.js.map