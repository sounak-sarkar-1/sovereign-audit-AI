import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

const payload = {
  sub: '66fe0a38-d314-424c-991f-46af967db7c6', // I need the actual user ID or it might fail guards
  email: 'manager1@test.com',
  role: 'manager',
  tenantSlug: 'test',
};

const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
  expiresIn: '1h',
});

console.log('TOKEN:' + token);
