# 🚀 Deployment Guide - SuprFi

## Prerequisites

Before deploying, you need:
- ✅ GitHub repository (done!)
- ✅ Vercel account (free tier works)
- ✅ Environment variables ready

---

## 📝 Environment Variables Needed

### **Required for Production:**

```bash
# Database (Supabase)
DATABASE_URL="your-supabase-connection-string"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/admin"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/admin"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="ACxxxxx..."
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# JWT Secret (for application tokens)
JWT_SECRET="generate-a-random-secret-here"

# App URL (will be your Vercel domain)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
```

---

## 🔐 Getting Production Keys

### **1. Clerk (Authentication)**
1. Go to https://clerk.com
2. Create a production application
3. Get your **production** keys (pk_live_... and sk_live_...)
4. Configure: Sign-in URL = `/sign-in`, After sign-in URL = `/admin`

### **2. Supabase (Database)**
1. Your current connection string works!
2. Or create a dedicated production database
3. Run migrations: `npx prisma migrate deploy`

### **3. Twilio (SMS)**
1. Go to https://twilio.com/console
2. Verify your sending phone number
3. Get production credentials (Account SID + Auth Token)
4. Buy a phone number or use your verified number

### **4. JWT Secret**
Generate a strong random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Deploy to Vercel

### **Option A: Via Vercel Dashboard (Easiest)**

1. **Go to Vercel:** https://vercel.com
2. **Click "Add New Project"**
3. **Import from GitHub:**
   - Select your GitHub account
   - Find `dvrose1/SuprFi` repository
   - Click "Import"

4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all variables from the list above
   - Make sure to use **production** keys!

6. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your live URL! 🎉

### **Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/doug/Desktop/SuprFi
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? suprfi (or your choice)
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# ... add all others

# Deploy to production
vercel --prod
```

---

## ✅ Post-Deployment Checklist

### **1. Verify Deployment**
- [ ] Visit your Vercel URL
- [ ] Homepage loads correctly
- [ ] Sign in works
- [ ] Admin dashboard loads

### **2. Test Critical Paths**

**Borrower Flow:**
- [ ] Create test application via API:
```bash
curl -X POST "https://your-app.vercel.app/api/v1/crm/offer-financing" \
  -H "Content-Type: application/json" \
  -d '{
    "crm_customer_id": "PROD-TEST-001",
    "customer": {
      "first_name": "Test",
      "last_name": "User",
      "email": "test@example.com",
      "phone": "+15551234567",
      "address": {
        "line1": "123 Test St",
        "city": "Austin",
        "state": "TX",
        "zip": "78701"
      }
    },
    "job": {
      "crm_job_id": "JOB-TEST-001",
      "estimate_amount": 10000.00,
      "service_type": "Test Service"
    }
  }'
```
- [ ] Complete application form
- [ ] See offers displayed

**Admin Flow:**
- [ ] Log in to `/admin`
- [ ] View applications list
- [ ] Open application detail
- [ ] Approve an application
- [ ] Check audit log

### **3. Database Migrations**
If you created a new production database:
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### **4. Configure Custom Domain** (Optional)
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain (e.g., `app.suprfi.com`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### **5. Set Up Monitoring** (Recommended)

**Vercel Analytics:** (Free)
- Already enabled by default
- View in Vercel dashboard

**Sentry for Error Tracking:** (Optional)
```bash
npm install @sentry/nextjs

# Follow setup wizard
npx @sentry/wizard@latest -i nextjs
```

---

## 🔧 Production Configuration

### **Middleware Warning Fix**
The warning about middleware can be ignored for now, but to fix:
1. In future Next.js versions, rename `src/middleware.ts` to `src/proxy.ts`
2. Or keep as is - it's just a deprecation warning

### **Environment-Specific Settings**

Create `next.config.js` adjustments for production:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  
  // If using images
  images: {
    domains: ['your-domain.com'],
  },
}

module.exports = nextConfig
```

### **Database Connection Pooling**
For production, ensure your Supabase connection string uses:
- `?pgbouncer=true` for connection pooling
- Or use Prisma Data Proxy (if needed)

---

## 🎯 Go-Live Checklist

### **Before Going Live:**
- [ ] All environment variables configured
- [ ] Production keys (not test/sandbox)
- [ ] Database migrations run
- [ ] Test all critical flows
- [ ] Verify email domains
- [ ] Verify phone numbers in Twilio
- [ ] Set up error monitoring
- [ ] Configure custom domain (if using)
- [ ] Review security settings
- [ ] Backup database
- [ ] Document admin credentials

### **Legal/Compliance:**
- [ ] Privacy policy (required before collecting data)
- [ ] Terms of service (required)
- [ ] CCPA compliance (if serving California)
- [ ] Credit reporting disclosures
- [ ] E-signature consent (ESIGN Act)
- [ ] Rate and fee disclosures

### **Business Readiness:**
- [ ] CRM integration tested (FieldRoutes)
- [ ] Lender partnerships ready (if routing)
- [ ] Support email configured
- [ ] Customer service process
- [ ] Fraud detection plan
- [ ] Manual review workflow

---

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `main`:
1. Push code to GitHub
2. Vercel detects changes
3. Runs build
4. Deploys to production
5. Rollback available if needed

**Preview Deployments:**
- Every pull request gets a preview URL
- Test before merging to production
- Share previews with stakeholders

---

## 📊 Monitoring & Maintenance

### **What to Monitor:**
- **Application volume** - Track in admin dashboard
- **Error rates** - Use Vercel logs or Sentry
- **API response times** - Vercel analytics
- **Database performance** - Supabase dashboard
- **Approval rates** - Admin stats
- **Customer drop-off** - Form completion rates

### **Regular Tasks:**
- Weekly: Review audit logs
- Weekly: Check error rates
- Monthly: Database backups
- Monthly: Security updates
- Quarterly: Dependency updates

---

## 🆘 Troubleshooting

### **Build Fails:**
```bash
# Run locally first
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for missing environment variables
```

### **Database Connection Issues:**
- Verify DATABASE_URL format
- Check IP whitelist in Supabase
- Ensure connection pooling enabled

### **Authentication Not Working:**
- Verify Clerk keys are production keys
- Check redirect URLs match
- Ensure domain is added in Clerk dashboard

### **SMS Not Sending:**
- Verify phone number in Twilio
- Check trial account limits
- Ensure phone number format (+1XXXXXXXXXX)

---

## 🎉 You're Ready to Deploy!

**Current Status:**
- ✅ Code committed to GitHub
- ✅ Production build verified
- ✅ All features working locally

**Next Steps:**
1. Get production environment variables
2. Deploy to Vercel (15 minutes)
3. Test on production
4. Go live! 🚀

---

## 📞 Support

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Clerk Docs: https://clerk.com/docs

**Common Resources:**
- Vercel Discord: https://discord.gg/vercel
- Next.js GitHub: https://github.com/vercel/next.js

---

*Good luck with your deployment!* 🚀
