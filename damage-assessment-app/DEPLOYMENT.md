# 🚀 Deployment Guide - DamageAssessment AI

Complete guide to deploy your application to production.

---

## 🎯 Quick Deploy (Vercel + Supabase) - 30 Minutes

### Step 1: Set Up Database (Supabase)

**1. Create Account**
- Go to [supabase.com](https://supabase.com)
- Sign up (free tier available)

**2. Create Project**
- Click "New Project"
- Name: `damage-assessment-prod`
- Database Password: (save this!)
- Region: Choose closest to you
- Wait 2 minutes for project to spin up

**3. Get Connection String**
- Go to Project Settings → Database
- Copy "Connection string" (Pooler or Direct)
- Replace `[YOUR-PASSWORD]` with your database password

```
Example:
postgresql://postgres.xyz123:PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

**4. Initialize Database**
```bash
# In your local project
cd c:/DEV/damage-assessment-app

# Add database URL to .env.local
DATABASE_URL="your-supabase-connection-string"

# Push schema to Supabase
npx prisma db push

# Generate Prisma client
npx prisma generate
```

✅ **Database is ready!**

---

### Step 2: Set Up File Storage (AWS S3)

**1. Create AWS Account**
- Go to [aws.amazon.com](https://aws.amazon.com)
- Sign up (free tier: 5GB storage free for 12 months)

**2. Create S3 Bucket**
```
AWS Console → S3 → Create bucket

Bucket name: damage-assessment-photos-prod
Region: us-east-1 (or your preferred region)
Block all public access: UNCHECK (we'll use presigned URLs)

Create bucket
```

**3. Configure CORS**
```
Bucket → Permissions → CORS

Add this:
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://your-domain.vercel.app"],
    "ExposeHeaders": []
  }
]
```

**4. Create IAM User**
```
AWS Console → IAM → Users → Add user

User name: damage-assessment-app
Access type: Programmatic access

Attach policy: AmazonS3FullAccess (or create custom policy)

Save Access Key ID and Secret Access Key!
```

✅ **S3 is ready!**

---

### Step 3: Get API Keys

**Anthropic Claude API:**
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create account
- Generate API key
- Copy: `sk-ant-...`

**Stripe (Optional for MVP):**
- Go to [stripe.com](https://stripe.com)
- Create account
- Get test keys from Dashboard

---

### Step 4: Deploy to Vercel

**1. Install Vercel CLI**
```bash
npm install -g vercel
```

**2. Login to Vercel**
```bash
vercel login
```

**3. Deploy from Local**
```bash
cd c:/DEV/damage-assessment-app

# First deployment
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? damage-assessment-ai
# - Directory? ./
# - Override settings? No
```

**4. Add Environment Variables**
```bash
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=damage-assessment-photos-prod
JWT_SECRET=generate-a-random-32-char-string
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**5. Redeploy with Environment Variables**
```bash
vercel --prod
```

✅ **App is LIVE!** 🎉

Your URL: `https://your-project.vercel.app`

---

## 🧪 Test Your Deployment

### 1. Test Landing Page
Visit `https://your-project.vercel.app`
- Should see landing page
- Click "Get Started" → Register page

### 2. Test Registration
- Create account
- Should redirect to dashboard
- Check Supabase: User should appear in `users` table

### 3. Test Job Creation
- Click "New Assessment"
- Fill property info
- Should create job in database

### 4. Test API
```bash
curl https://your-project.vercel.app/api/health
```

---

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Test connection locally first
npx prisma db push

# If fails:
# - Check DATABASE_URL format
# - Verify password is correct
# - Check Supabase is running
```

### Build Errors on Vercel
```bash
# Common issues:

# 1. Missing environment variables
# → Add all variables in Vercel dashboard

# 2. Prisma not generating
# → Add to package.json scripts:
"vercel-build": "prisma generate && next build"

# 3. Type errors
# → Run locally: npm run build
# → Fix errors shown
```

### S3 Upload Fails
```
# Check:
# 1. CORS configuration correct
# 2. Bucket permissions allow uploads
# 3. IAM user has S3 access
# 4. Environment variables are correct
```

---

## 📊 Monitor Your App

### Vercel Dashboard
- View deployments
- Check logs
- Monitor performance
- Review analytics

### Supabase Dashboard
- View database tables
- Check API usage
- Monitor storage

### AWS CloudWatch
- S3 request metrics
- Storage usage
- Access logs

---

## 🔒 Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Enable Vercel password protection (if needed)
- [ ] Set up custom domain with HTTPS
- [ ] Review S3 bucket permissions
- [ ] Enable Supabase RLS (Row Level Security)
- [ ] Add rate limiting to API routes
- [ ] Set up error tracking (Sentry)
- [ ] Configure CORS properly
- [ ] Review all environment variables

---

## 💰 Cost Estimates

### Free Tier (Testing)
- **Vercel:** Free (hobby plan)
- **Supabase:** Free (500MB database, 1GB storage)
- **AWS S3:** Free first year (5GB)
- **Anthropic Claude:** Pay per use (~$0.01 per report)

**Total:** ~$0-10/month for testing

### Production (100 reports/month)
- **Vercel:** $0-20
- **Supabase:** $25 (Pro plan recommended)
- **AWS S3:** $5-10
- **Anthropic Claude:** $50-100

**Total:** $80-155/month

### Scale (500 reports/month)
- **Vercel:** $20
- **Supabase:** $25
- **AWS S3:** $20
- **Anthropic Claude:** $250-500
- **Redis (Upstash):** $10

**Total:** $325-575/month

---

## 🚀 Going Further

### Custom Domain
```bash
# Vercel Dashboard → Domains → Add Domain
# Follow DNS configuration instructions
```

### Enable Stripe
```bash
# 1. Get Stripe keys
# 2. Add to Vercel environment variables
# 3. Set up products in Stripe dashboard
# 4. Configure webhooks
```

### Add Monitoring
```bash
# Sentry
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# Datadog
# Add Datadog integration in Vercel
```

### Set Up CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🆘 Need Help?

**Check README:** Full documentation in `README.md`

**Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)

**Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

**Common Issues:**
- Database connection: Check DATABASE_URL format
- Build errors: Run `npm run build` locally first
- Upload errors: Verify S3 CORS and permissions
- Auth issues: Check JWT_SECRET is set

---

## ✅ Deployment Checklist

Final checklist before launch:

**Pre-Launch:**
- [ ] Local development working (`npm run dev`)
- [ ] All tests passing
- [ ] Database schema pushed to Supabase
- [ ] S3 bucket created and configured
- [ ] All API keys obtained

**Deployment:**
- [ ] Code deployed to Vercel
- [ ] Environment variables configured
- [ ] Custom domain set up (optional)
- [ ] SSL certificate active

**Post-Launch:**
- [ ] Test registration flow
- [ ] Test job creation
- [ ] Test file uploads
- [ ] Monitor error logs
- [ ] Check database is populating

**Ready to launch!** 🚀

---

*Last updated: 2025-09-30*