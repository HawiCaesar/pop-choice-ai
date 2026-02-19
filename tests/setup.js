import { beforeAll } from 'vitest';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

beforeAll(() => {
  console.log('Starting E2E test suite with BrowserBase + Stagehand');

  // Debug: Verify environment variables are loaded
  const requiredVars = {
    'BROWSERBASE_API_KEY': process.env.BROWSERBASE_API_KEY ? '✓' : '✗',
    'BROWSERBASE_PROJECT_ID': process.env.BROWSERBASE_PROJECT_ID ? '✓' : '✗',
    'ANTHROPIC_API_KEY': process.env.ANTHROPIC_API_KEY ? '✓' : '✗',
    'TEST_APP_URL': process.env.TEST_APP_URL || 'http://localhost:5173 (default)'
  };
  
  console.log('\nEnvironment Variables Status:');
  Object.entries(requiredVars).forEach(([key, value]) => {
    console.log(`  ${value} ${key}`);
  });
  console.log('');
});
