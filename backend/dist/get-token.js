"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const payload = {
    sub: '66fe0a38-d314-424c-991f-46af967db7c6',
    email: 'manager1@test.com',
    role: 'manager',
    tenantSlug: 'test',
};
const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1h',
});
console.log('TOKEN:' + token);
//# sourceMappingURL=get-token.js.map