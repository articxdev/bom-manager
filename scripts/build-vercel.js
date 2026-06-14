const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  console.log('Preparing Prisma schema for Vercel (switching from SQLite to PostgreSQL)...');
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Prisma schema file not found at: ${schemaPath}`);
  }

  let content = fs.readFileSync(schemaPath, 'utf-8');
  
  // Replace the provider to postgresql dynamically for Vercel
  content = content.replace('provider = "sqlite"', 'provider = "postgresql"');
  
  fs.writeFileSync(schemaPath, content);
  console.log('Prisma schema updated to PostgreSQL successfully.');

  console.log('Running: npx prisma generate');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('Running: npx prisma db push');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('Running Next.js build...');
  // Next.js build command as specified in package.json/Next build config
  execSync('next build', { stdio: 'inherit' });

  console.log('Vercel build phase completed successfully!');
} catch (error) {
  console.error('Vercel build script failed:', error.message || error);
  process.exit(1);
}
