import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
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

fs.writeFileSync('token.txt', token);
console.log('Token written to token.txt');
