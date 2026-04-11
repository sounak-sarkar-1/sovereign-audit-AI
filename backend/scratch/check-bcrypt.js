const bcrypt = require('bcrypt');

async function check() {
  const password = 'TestPassword123!';
  const hash = await bcrypt.hash(password, 12);
  console.log('Password:', password);
  console.log('Hash:', hash);
  const match = await bcrypt.compare(password, hash);
  console.log('Match:', match);
}

check();
