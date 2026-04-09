"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const fs = require("fs");
async function hit() {
    const token = fs.readFileSync('token.txt', 'utf8').trim();
    try {
        const res = await axios_1.default.get('http://localhost:3000/api/v1/shared/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-Slug': 'test'
            }
        });
        console.log('SUCCESS:', JSON.stringify(res.data));
    }
    catch (err) {
        if (err.response) {
            console.log('ERROR STATUS:', err.response.status);
            console.log('ERROR BODY:', JSON.stringify(err.response.data));
        }
        else {
            console.log('ERROR:', err.message);
        }
    }
}
hit();
//# sourceMappingURL=test-notifications.js.map