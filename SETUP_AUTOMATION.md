# 🤖 Automated Vercel Setup - Complete Guide

Your BOM application now has **fully automated Vercel Postgres deployment**. You only need to paste your connection string!

---

## 🚀 Three Ways to Deploy

### **Option 1: Interactive Setup (Easiest)** ⭐

```bash
npm run setup:vercel:interactive
```

This guides you through:
1. Getting your connection string from Vercel
2. Choosing with/without sample data
3. Running all setup automatically

---

### **Option 2: Quick Setup (No Prompts)**

```bash
# Without sample data
npm run setup:vercel "postgresql://user:pass@ep-xxxx.postgres.vercel-storage.com/verceldb?sslmode=require"

# With sample data (for testing)
npm run setup:vercel:with-seed "postgresql://user:pass@ep-xxxx.postgres.vercel-storage.com/verceldb?sslmode=require"
```

---

### **Option 3: Manual Control**

For advanced users who want to run each step:

```bash
# 1. Update Prisma & .env
$env:DATABASE_URL = "postgresql://..."
npx prisma generate

# 2. Sync schema
npm run db:push

# 3. Seed data (optional)
npm run db:seed
```

---

## 📋 What Gets Automated

When you run any setup command, the system automatically:

✅ **Configures Prisma**
   - Changes provider from SQLite → PostgreSQL
   - Sets up environment variables

✅ **Generates Client**
   - Creates Prisma Client for new database

✅ **Syncs Schema**
   - Pushes all tables to PostgreSQL
   - Creates indexes and relationships

✅ **Seeds Data** (optional)
   - Adds 5 sample components
   - Creates 2 sample products with BOMs
   - Adds 4 sample transactions
   - Perfect for testing the UI

---

## 🎯 Complete Deployment Workflow

### **Step 1: Prepare Vercel Postgres** (3 min)

1. Go to https://vercel.com/dashboard
2. Storage tab → Create Database → Postgres
3. Wait for creation
4. Copy connection string

### **Step 2: Run Setup Locally** (2 min)

```bash
npm run setup:vercel:interactive
# Paste your connection string when prompted
```

### **Step 3: Test Locally** (1 min)

```bash
npm run dev
```

Open http://localhost:3000 to verify everything works

### **Step 4: Deploy to Vercel** (5 min)

```bash
# Commit and push
git add .
git commit -m "Configure Vercel Postgres"
git push origin main
```

**In Vercel Dashboard:**
1. Create new project → Import GitHub repo
2. Settings → Environment Variables
3. Add `DATABASE_URL` with your connection string
4. Deploy! ✅

---

## 🔐 What's Automated Behind the Scenes

### `setup-vercel-db.js` Script

**Location:** `scripts/setup-vercel-db.js`

**Automates:**
```javascript
// 1. Updates Prisma schema provider from sqlite → postgresql
// 2. Updates .env.local with connection string
// 3. Runs: npx prisma generate
// 4. Runs: npm run db:push (syncs to database)
// 5. Optionally runs: npm run db:seed
```

### `vercel-setup-interactive.js` Script

**Location:** `scripts/vercel-setup-interactive.js`

**Features:**
- Interactive CLI that guides you through each step
- Copy-paste friendly connection string input
- Choice between with/without sample data
- Color-coded output for easy reading

---

## 📝 npm Commands Reference

```bash
# SETUP (Choose one)
npm run setup:vercel:interactive          # Interactive wizard (recommended)
npm run setup:vercel "<CONNECTION_STRING>" # With URL parameter
npm run setup:vercel:with-seed "<URL>"   # With sample data

# DEVELOPMENT
npm run dev                 # Start dev server
npm run build              # Build for production

# DATABASE
npm run db:push            # Sync schema
npm run db:migrate         # Create migration
npm run db:seed            # Populate sample data

# OTHER
npm start                  # Run production server
npm run lint              # Lint code
```

---

## ✅ Verification Checklist

After setup:

- [ ] Script completed without errors
- [ ] `.env.local` has `DATABASE_URL` set
- [ ] `prisma/schema.prisma` shows `provider = "postgresql"`
- [ ] `npm run dev` works and loads http://localhost:3000
- [ ] Dashboard displays (empty or with sample data)
- [ ] Can create new component
- [ ] Forms submit without database errors
- [ ] Vercel deployment shows green checkmark

---

## 🆘 Troubleshooting

### "Connection refused" Error

```bash
# Check connection string format
cat .env.local | grep DATABASE_URL

# Should contain: postgresql://...?sslmode=require
# If missing, re-run setup:
npm run setup:vercel:interactive
```

### Build Fails on Vercel

1. Check Vercel logs for details
2. Verify DATABASE_URL is in environment variables
3. Ensure connection string is correct (copy again from Vercel Postgres)
4. Redeploy with correct URL

### Database Empty After Deploy

The setup script can seed locally, but for production you may need to:

```bash
# Manual seed in Vercel (advanced)
# Or re-run setup with --seed flag before deploying
```

### Need to Switch Back to SQLite?

```bash
# 1. Edit prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

# 2. Update .env.local
DATABASE_URL="file:./prisma/dev.db"

# 3. Sync
npm run db:push
```

---

## 🎓 How It Works

```
┌─────────────────────┐
│  Connection String  │ ← You paste from Vercel Postgres
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────┐
│  setup-vercel-db.js             │
│  - Updates Prisma schema        │
│  - Updates .env.local           │
│  - Generates Prisma Client      │
│  - Pushes schema to database    │
│  - Optionally seeds data        │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────┐
│  Ready to Deploy!   │ ← `npm run dev` or push to GitHub
└─────────────────────┘
```

---

## 🚀 Next Steps After Deployment

1. **Access your live app** at Vercel deployment URL
2. **Monitor database** in Vercel Storage dashboard
3. **Set up GitHub Actions** for auto-deploy on push
4. **Enable preview deployments** for pull requests
5. **Configure domain name** if desired
6. **Scale features** - auth, API endpoints, etc.

---

## 📚 Documentation Files

- **`VERCEL_QUICKSTART.md`** - 5 minute quick start
- **`DEPLOYMENT_VERCEL.md`** - Detailed deployment guide
- **`README.md`** - Full project documentation
- **`scripts/setup-vercel-db.js`** - Main setup automation
- **`scripts/vercel-setup-interactive.js`** - Interactive setup wizard

---

## 💡 Pro Tips

1. **Test locally first** - Always run `npm run dev` before deploying
2. **Seed sample data** - Use `--seed` flag to populate test data
3. **Monitor queries** - Check Vercel Storage "Insights" tab for performance
4. **Backup data** - Vercel handles daily backups automatically
5. **Use preview deploys** - Set up GitHub to preview PRs before merging

---

## ⚡ TL;DR - Just Want It Done?

```bash
# 1. Copy connection string from Vercel Postgres
# 2. Run:
npm run setup:vercel:interactive

# 3. Test:
npm run dev

# 4. Deploy:
git push origin main

# 5. In Vercel: Add DATABASE_URL env var and deploy
# Done! 🎉
```

---

**Everything is automated. You only provide the connection string!** 🤖
