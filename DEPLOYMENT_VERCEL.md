# 🚀 Vercel Postgres Deployment Guide

This guide walks you through deploying your BOM application to Vercel with PostgreSQL database.

---

## 📋 Prerequisites

- Vercel account (free at https://vercel.com)
- GitHub repository
- This BOM project

---

## 🔧 Setup Steps

### **Step 1: Create Vercel Postgres Database** (2 minutes)

1. Go to **Vercel Dashboard** → https://vercel.com/dashboard
2. Click **"Storage"** tab
3. Click **"Create Database"** → Select **"Postgres"**
4. Choose region closest to your users
5. Click **"Create"** and wait for setup

### **Step 2: Get Connection String** (1 minute)

1. In Vercel Storage, find your Postgres database
2. Click on it to open details
3. Go to **".env.local"** tab
4. **Copy the full connection string** (starts with `postgresql://`)
   ```
   postgresql://user:password@ep-xxxx.region.postgres.vercel-storage.com/verceldb?sslmode=require
   ```

### **Step 3: Run Local Setup** (3 minutes)

Run the automated setup script with your connection string:

```bash
# Windows PowerShell
npm run setup:vercel "postgresql://user:password@ep-xxxx.region.postgres.vercel-storage.com/verceldb?sslmode=require"

# Or with sample data:
npm run setup:vercel:with-seed "postgresql://user:password@ep-xxxx.region.postgres.vercel-storage.com/verceldb?sslmode=require"
```

**What this script does automatically:**
- ✅ Updates Prisma schema to PostgreSQL
- ✅ Updates .env.local with connection string  
- ✅ Generates Prisma Client
- ✅ Pushes schema to database
- ✅ Optionally seeds sample data

### **Step 4: Test Locally** (2 minutes)

```bash
npm run dev
```

Open http://localhost:3000 - verify everything works!

### **Step 5: Deploy to Vercel** (5 minutes)

#### 5A: Push to GitHub
```bash
git add .
git commit -m "Configure Vercel Postgres"
git push origin main
```

#### 5B: Create Vercel Project
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository
4. Click **"Import"**

#### 5C: Set Environment Variables
1. In Vercel Project Settings → **"Environment Variables"**
2. Add new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Paste your PostgreSQL connection string
   - **Environments:** Check all (Production, Preview, Development)
3. Click **"Save"**

#### 5D: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2 minutes)
3. Click the deployment URL to access your live app!

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Vercel build succeeded (green checkmark)
- [ ] App loads at deployment URL
- [ ] Dashboard displays (may be empty if you didn't seed)
- [ ] Can create new component
- [ ] Can view components list
- [ ] Database queries work (check Vercel logs if issues)

---

## 🔍 Troubleshooting

### Build Fails with Database Error
**Solution:** Ensure DATABASE_URL is set in Vercel environment variables with exact connection string.

### "Connection refused" error
**Solution:** Wait 1-2 minutes for Vercel to apply environment variables, then redeploy.

### Database is empty after deployment
**Solution:** Seed was skipped. Run locally with `--seed` flag or manually run in Vercel using:
```bash
npm run db:seed
```

### Can I still use SQLite locally?
**No.** Once configured for Postgres, it uses the connection string from `.env.local`. To switch back:
- Change `datasource db { provider = "sqlite" ... }` in `prisma/schema.prisma`
- Update `.env.local` to `DATABASE_URL="file:./prisma/dev.db"`
- Run `npm run db:push` again

---

## 📊 Database Limits (Vercel Postgres Free Tier)

- **Connections:** 1 concurrent connection
- **Requests:** Unlimited
- **Storage:** 256 MB
- **Perfect for:** Prototyping and small production apps

Upgrade anytime if you need more.

---

## 🔐 Security Notes

1. **Never commit .env.local** to GitHub (it's in .gitignore)
2. **Keep connection string secret** - don't share it
3. **Use SSL mode** - already enabled in connection string
4. **Vercel handles backups** - no action needed

---

## 📈 Monitoring & Logs

### View Database Queries
- Vercel Dashboard → Storage → Your Database → **"Insights"**

### View Application Logs
- Vercel Dashboard → Your Project → **"Deployments"** → Click deployment → **"Logs"**

### Connect to Database Directly
```bash
# Using psql (if installed)
psql "your_connection_string_here"

# Or use Vercel Studio:
# https://vercel.com/dashboard/storage
```

---

## 🎯 What's Next

- Set up GitHub Actions for automatic deployments
- Enable production branch auto-deploy
- Monitor performance in Vercel Analytics
- Scale features (auth, multi-warehouse, etc.)

---

## 📞 Quick Commands Reference

```bash
# Local setup (automatic)
npm run setup:vercel "postgresql://..."

# With sample data
npm run setup:vercel:with-seed "postgresql://..."

# Test locally
npm run dev

# Push database updates
npm run db:push

# View data in GUI (local)
npx prisma studio

# Deploy from GitHub (automatic in Vercel)
git push origin main
```

---

**Happy deploying!** 🚀

Questions? Check Vercel docs: https://vercel.com/docs/storage/vercel-postgres
