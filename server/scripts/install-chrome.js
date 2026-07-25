const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const cacheDir = path.join(__dirname, '..', '.cache', 'puppeteer');
fs.mkdirSync(cacheDir, { recursive: true });

console.log('Installing Puppeteer Chrome to workspace cache:', cacheDir);
try {
  execSync('npx puppeteer browsers install chrome', {
    env: { ...process.env, PUPPETEER_CACHE_DIR: cacheDir },
    stdio: 'inherit',
  });
} catch (e) {
  console.warn('Chrome install warning:', e.message);
}
