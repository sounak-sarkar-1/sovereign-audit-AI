import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalSetup(config: FullConfig) {
  console.log('--- Initializing Global E2E Setup ---');
  
  try {
    console.log('Seeding test database...');
    // Seed creates the 4 roles, mapping, and a test audit
    execSync('cd backend && npm run seed:test', { stdio: 'inherit' });
    
    // Read from the shared env file
    const envPath = path.join(__dirname, '..', 'e2e-env.json');
    if (fs.existsSync(envPath)) {
      const e2eEnv = JSON.parse(fs.readFileSync(envPath, 'utf8'));
      process.env.TEST_AUDIT_ID = e2eEnv.TEST_AUDIT_ID;
    }
    
    console.log('--- Global Setup Complete ---');
  } catch (error) {
    console.error('Global setup failed:', error);
    process.exit(1);
  }
}

export default globalSetup;
