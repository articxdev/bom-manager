# ⚡ Quick Start: Deploy to Vercel in 5 Minutes

## 1️⃣ Get Your Database Connection String

1. Go to https://vercel.com/dashboard → **Storage** tab
2. Click **"Create Database"** → Select **Postgres**
3. Click **Create** and wait for setup
4. Click your database → **".env.local"** tab
5. **Copy the connection string** (starts with `postgresql://...`)

---

## 2️⃣ Run Setup Script (Paste URL Here)

```bash
npm run setup:vercel "PASTE_YOUR_CONNECTION_STRING_HERE"
```

**Example:**
```bash
npm run setup:vercel "postgresql://user:pass@ep-xxxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"
```

**With sample data:**
```bash
npm run setup:vercel:with-seed "postgresql://user:pass@ep-xxxx.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require"
```

---

## 3️⃣ Test Locally

```bash
npm run dev
```

Open http://localhost:3000 ✅

---

## 4️⃣ Deploy to Vercel

```bash
git push origin main
```

**In Vercel Dashboard:**
1. Click **"Add New Project"** → Select your GitHub repo
2. Click **"Import"**
3. **Environment Variables** → Add:
   - **Name:** `DATABASE_URL`
   - **Value:** Paste same connection string
4. Click **"Deploy"** ✅

---

## 5️⃣ Done! 🎉

Your app is live. Visit the Vercel deployment URL!

---

## 📝 That's it!

- ✅ PostgreSQL configured
- ✅ Schema synced
- ✅ Deployed to Vercel
- ✅ Ready to use

**All you had to do was paste your connection string!**
