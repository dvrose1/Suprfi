# 🔧 Supabase Connection Pooling Setup for Vercel

## ⚠️ The Real Issue

Supabase requires you to **enable Supavisor** (their connection pooler) for serverless deployments like Vercel. Port 6543 needs to be enabled in your Supabase project settings.

---

## 📋 Steps to Enable Connection Pooling in Supabase

### **1. Go to Supabase Dashboard**
Visit: https://supabase.com/dashboard/project/urlhjfuteyqquhscsgup

### **2. Navigate to Database Settings**
- Click on **Settings** (gear icon in sidebar)
- Click **Database**
- Scroll to **Connection Pooling** section

### **3. Enable Connection Pooling**
Look for **"Connection Pooling"** or **"Supavisor"** settings:

- **Mode:** Select **Transaction** (recommended for Prisma)
- **Pool Size:** Set to at least **15** (default is usually fine)
- **Enable:** Make sure it's turned ON

### **4. Get the Pooled Connection String**

After enabling, Supabase will show you a new connection string that looks like:

**Option A: If using Session Mode (Port 6543):**
```
postgresql://postgres.urlhjfuteyqquhscsgup:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Option B: If using Transaction Mode (Port 5432 with pooler):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.urlhjfuteyqquhscsgup.supabase.co:5432/postgres?pgbouncer=true
```

---

## 🎯 What to Do If Pooling Isn't Available

If Supabase doesn't show connection pooling options, you have two choices:

### **Option 1: Use Prisma Accelerate (Recommended)**

Prisma Accelerate provides connection pooling as a service.

1. **Sign up for Prisma Accelerate:**
   - Visit: https://www.prisma.io/data-platform/accelerate
   - Free tier: 1M query credits/month

2. **Get your Accelerate connection string:**
   ```
   prisma://accelerate.prisma-data.net/?api_key=your-api-key
   ```

3. **Update your Prisma schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL") // Accelerate URL
     directUrl = env("DIRECT_DATABASE_URL") // Direct Supabase URL
   }
   ```

4. **Update environment variables:**
   ```env
   DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=your-api-key"
   DIRECT_DATABASE_URL="postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:5432/postgres"
   ```

### **Option 2: Use Simpler Connection with Limits**

For lower traffic, use direct connection with aggressive settings:

**Update Prisma Client:**

Create/update `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// In production, create a new client for each request (serverless)
// In development, reuse the client
export const prisma = 
  process.env.NODE_ENV === 'production'
    ? createPrismaClient()
    : globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Ensure connection is closed after each serverless invocation
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
```

**Update DATABASE_URL in Vercel:**
```
postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:5432/postgres?connection_limit=1&pool_timeout=0&connect_timeout=10
```

---

## 🔍 Check Current Supabase Plan

Your current Supabase plan affects pooling availability:

| Plan | Connection Pooling | Max Connections |
|------|-------------------|-----------------|
| **Free** | ✅ Available (Supavisor) | 60 direct, unlimited pooled |
| **Pro** | ✅ Available | 200 direct, unlimited pooled |
| **Enterprise** | ✅ Available | Custom |

Even on the **free plan**, you should have access to connection pooling!

---

## ✅ Recommended Solution for Vercel

### **Best Approach: Use Prisma Accelerate**

This is the cleanest solution and it's free for your usage level:

1. ✅ No connection pool exhaustion
2. ✅ Built-in query caching
3. ✅ Better performance
4. ✅ Works with any database provider
5. ✅ Free tier: 1M queries/month (plenty for MVP)

### **Steps:**
```bash
# 1. Sign up at https://console.prisma.io/
# 2. Create a new Accelerate project
# 3. Connect your Supabase database
# 4. Get your Accelerate connection string
# 5. Update Vercel environment variables:

DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_KEY"
DIRECT_DATABASE_URL="postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:5432/postgres"
```

---

## 🆘 Quick Fix: Test if Pooling Works

Try these connection strings in Vercel (one at a time):

### **Test 1: Standard Connection**
```
postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:5432/postgres
```

### **Test 2: With Pool Settings**
```
postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:5432/postgres?connection_limit=1&pool_timeout=20&connect_timeout=15
```

### **Test 3: IPv6 (if IPv4 is blocked)**
```
postgresql://postgres:ddoubleV9%se@db.urlhjfuteyqquhscsgup.supabase.co:5432/postgres?options=-c%20sslmode=require
```

---

## 📊 Current Status

✅ **Local connection:** Working  
❌ **Vercel deployment:** Failing  
🔍 **Likely cause:** No connection pooling configured

**Next steps:**
1. Check Supabase dashboard for connection pooling settings
2. If not available, use Prisma Accelerate (5-minute setup)
3. Update Vercel environment variables
4. Redeploy

---

*This will solve your production database connection issues!* 🚀
