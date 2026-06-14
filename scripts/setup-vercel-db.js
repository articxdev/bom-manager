#!/usr/bin/env node

/**
 * Automated Vercel Postgres Setup Script
 * Run: node scripts/setup-vercel-db.js <connection_string>
 * 
 * This script automates:
 * 1. Updates Prisma schema to PostgreSQL
 * 2. Updates .env.local with connection string
 * 3. Pushes schema to database
 * 4. Seeds sample data
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const connectionString = args[0];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}\n`),
};

function updatePrismaSchema() {
  log.info('Updating Prisma schema to PostgreSQL...');
  
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  let content = fs.readFileSync(schemaPath, 'utf-8');
  
  // Replace datasource provider
  content = content.replace(
    /datasource db \{[\s\S]*?provider = "sqlite"[\s\S]*?\}/,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  );
  
  fs.writeFileSync(schemaPath, content);
  log.success('Prisma schema updated to PostgreSQL');
}

function updateEnvLocal(connectionString) {
  log.info('Updating .env.local with connection string...');
  
  const envPath = path.join(__dirname, '../.env.local');
  const envContent = `DATABASE_URL="${connectionString}"`;
  
  fs.writeFileSync(envPath, envContent);
  log.success('.env.local updated');
}

function runCommand(cmd, description) {
  try {
    log.info(description);
    execSync(cmd, { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'powershell.exe' : true
    });
    log.success(`${description} completed`);
    return true;
  } catch (error) {
    log.error(`${description} failed`);
    return false;
  }
}

async function main() {
  log.title('🗄️  Vercel Postgres Setup Automation');

  if (!connectionString) {
    log.error('Connection string not provided');
    console.log('\nUsage:');
    console.log('  node scripts/setup-vercel-db.js "<postgresql://user:password@...>"');
    console.log('\nExample:');
    console.log('  node scripts/setup-vercel-db.js "postgresql://user:pass@ep-xxxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"');
    process.exit(1);
  }

  try {
    // Step 1: Update Prisma Schema
    log.title('Step 1: Updating Configuration');
    updatePrismaSchema();
    updateEnvLocal(connectionString);

    // Step 2: Generate Prisma Client
    log.title('Step 2: Generating Prisma Client');
    runCommand('npx prisma generate', 'Generating Prisma Client');

    // Step 3: Push Schema to Database
    log.title('Step 3: Syncing Database Schema');
    runCommand('npx prisma db push --skip-generate', 'Pushing schema to PostgreSQL');

    // Step 4: Seed Database
    log.title('Step 4: Seeding Sample Data');
    const shouldSeed = process.argv.includes('--seed');
    if (shouldSeed) {
      runCommand('npm run db:seed', 'Seeding database with sample data');
    } else {
      log.warning('Skipping seed (use --seed flag to populate sample data)');
    }

    // Success Summary
    log.title('✨ Setup Complete!');
    console.log(`${colors.green}${colors.bright}Your database is ready!${colors.reset}\n`);
    console.log('Next steps:');
    console.log('  1. Test locally: npm run dev');
    console.log('  2. Deploy to Vercel:');
    console.log('     - Push to GitHub');
    console.log('     - In Vercel: Set DATABASE_URL env variable');
    console.log('     - Vercel will auto-deploy\n');

  } catch (error) {
    log.error('Setup failed: ' + error.message);
    process.exit(1);
  }
}

main();
