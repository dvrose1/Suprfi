# 🔧 Vercel Environment Variables Update - FIX FOR DATABASE CONNECTION

## ⚠️ ACTION REQUIRED

Your Vercel deployment is failing because it's using a **direct PostgreSQL connection** instead of a **pooled connection**. Vercel's serverless functions need connection pooling.

---

## 📋 Steps to Fix

### **1. Go to Vercel Dashboard**
- Visit: https://vercel.com/dashboard
- Find your SuprFi project
- Go to: **Settings** → **Environment Variables**

### **2. Update DATABASE_URL**

**Find the existing `DATABASE_URL` variable and UPDATE it to:**

```
postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

**Key Changes:**
- ✅ Port changed from `5432` → `6543` (Supabase Transaction Pooler)
- ✅ Added `?pgbouncer=true` flag
- ✅ Added `&connection_limit=1` for serverless

### **3. Add DIRECT_DATABASE_URL (for migrations)**

**Click "Add New" and create:**

**Name:** `DIRECT_DATABASE_URL`

**Value:**
```
postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:5432/postgres
```

**Environment:** Select all (Production, Preview, Development)

---

## 🚀 Redeploy

After updating the environment variables:

### **Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**

### **Option B: Via Git Push**
```bash
cd /Users/doug/Documents/SuprFi
git commit --allow-empty -m "chore: trigger redeploy with updated env vars"
git push origin main
```

---

## ✅ What Changed Locally

I've already updated your local `.env.local` file:

```env
# Database (Pooled connection for Vercel/serverless)
DATABASE_URL="postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"

# Database (Direct connection for migrations)
DIRECT_DATABASE_URL="postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:5432/postgres"
```

And updated `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

✅ **Tested locally - Connection works!**

---

## 🔍 Why This Fixes the Issue

### **The Problem:**
- Direct PostgreSQL connections (`port 5432`) have a **limited connection pool** (default ~100)
- Vercel serverless functions create **NEW connections for each request**
- This quickly exhausts the connection pool → "Can't reach database server"

### **The Solution:**
- Supabase Transaction Pooler (`port 6543`) uses **PgBouncer**
- PgBouncer **reuses connections** efficiently
- `connection_limit=1` ensures each serverless function only uses 1 connection
- `pgbouncer=true` tells Prisma to use pooler-compatible mode

### **Why Two URLs:**
- `DATABASE_URL` (pooled) → Used for queries in production
- `DIRECT_DATABASE_URL` (direct) → Used for schema migrations only

---

## 🎯 After Redeploying

### **Test Your Production Site:**

1. **Visit your Vercel URL**
2. **Test API endpoint:**
```bash
curl https://your-app.vercel.app/api/health
```

3. **Check admin dashboard:**
```
https://your-app.vercel.app/admin
```

4. **Monitor Vercel logs:**
   - Go to Deployments → Latest → Logs
   - Look for database connection success

---

## 📊 Connection String Comparison

| Configuration | Port | Use Case | Max Connections |
|--------------|------|----------|-----------------|
| **Direct** (OLD) | 5432 | Traditional apps | ~100 total |
| **Pooled** (NEW) | 6543 | Serverless/Vercel | ~10,000+ via pooling |

---

## 🆘 If Still Having Issues

### **Check Supabase Settings:**
1. Go to: https://supabase.com/dashboard
2. Find your project: `urlhjfuteyqquhscsgup`
3. Go to: **Settings** → **Database**
4. Verify **Connection Pooling** is enabled
5. Use the **"Transaction Mode"** connection string (port 6543)

### **Verify Environment Variables in Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Check env vars
vercel env ls
```

### **Check Logs:**
```bash
vercel logs --follow
```

---

## ✅ Summary

**What you need to do:**
1. ✅ Update `DATABASE_URL` in Vercel (use port 6543)
2. ✅ Add `DIRECT_DATABASE_URL` in Vercel (use port 5432)
3. ✅ Redeploy

**What I already did:**
1. ✅ Updated `.env.local`
2. ✅ Updated `prisma/schema.prisma`
3. ✅ Regenerated Prisma Client
4. ✅ Tested connection locally

---

*This should completely fix your production database connection issues!* 🚀
