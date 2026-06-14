#!/usr/bin/env node

/**
 * Interactive Vercel Postgres Setup Helper
 * Run: node scripts/vercel-setup-interactive.js
 * 
 * Guides user through pasting connection string and runs setup
 */

const readline = require('readline');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
  step: (num, msg) => console.log(`${colors.cyan}${num}. ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  code: (msg) => console.log(`${colors.bright}  ${msg}${colors.reset}`),
};

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  log.title('🗄️  Vercel Postgres Setup Helper');

  console.log('Follow these steps to get your connection string:\n');
  log.step(1, 'Go to https://vercel.com/dashboard');
  log.step(2, 'Click "Storage" tab');
  log.step(3, 'Click "Create Database" → Select "Postgres"');
  log.step(4, 'Click "Create" and wait for setup');
  log.step(5, 'Click your database → ".env.local" tab');
  log.step(6, 'Copy the connection string (starts with postgresql://)');

  console.log('\n' + colors.bright + '⏸️  Ready? Press Enter when you have your connection string...' + colors.reset);
  await question('');

  let connectionString = '';
  let isValid = false;

  while (!isValid) {
    connectionString = await question(
      `\n${colors.cyan}Paste your connection string:${colors.reset}\n$ `
    );

    if (!connectionString) {
      log.warning('Connection string cannot be empty');
      continue;
    }

    if (!connectionString.startsWith('postgresql://')) {
      log.warning('Connection string should start with "postgresql://"');
      continue;
    }

    if (!connectionString.includes('@')) {
      log.warning('Connection string format invalid (missing @)');
      continue;
    }

    isValid = true;
    log.success('Connection string validated');
  }

  console.log('\n' + colors.bright + 'Options:' + colors.reset);
  console.log('  1. Setup without sample data (recommended for fresh start)');
  console.log('  2. Setup with sample data (recommended for testing)');

  let choice = '';
  while (!['1', '2'].includes(choice)) {
    choice = await question('\nSelect option (1 or 2): ');
  }

  rl.close();

  const withSeed = choice === '2';

  console.log('');
  log.title('Starting setup...');

  try {
    // Run setup script
    const cmd = withSeed
      ? `npm run setup:vercel:with-seed "${connectionString}"`
      : `npm run setup:vercel "${connectionString}"`;

    execSync(cmd, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'powershell.exe' : true
    });

    log.title('✨ Setup Complete!');

    console.log('Next steps:\n');
    log.step(1, 'Test locally:');
    log.code('npm run dev');
    log.step(2, 'Push to GitHub:');
    log.code('git push origin main');
    log.step(3, 'Create Vercel project:');
    log.code('https://vercel.com/dashboard → Import from GitHub');
    log.step(4, 'Add DATABASE_URL environment variable in Vercel');
    log.step(5, 'Deploy and enjoy! 🚀');

  } catch (error) {
    log.warning('Setup encountered an error');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
