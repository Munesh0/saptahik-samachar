# 🚀 साप्ताहिक समाचार — Deployment Guide

## ⚠️ Important: I Cannot Deploy For You

I don't have access to your accounts. **You must follow these steps yourself.**
But I tell you exactly what to click and what to paste.

---

## 📋 WHAT I NEED FROM YOU (Answer These)

### 1. Supabase Account
- [ ] Do you have a Supabase account? (Free signup at supabase.com)
- [ ] What is your **Supabase Project URL**? (Looks like: `https://xxxxxxxx.supabase.co`)
- [ ] What is your **Supabase Anon Key**? (Starts with `eyJ...`)
- [ ] What is your **Supabase Service Role Key**? (Also in Project Settings → API)

### 2. Vercel Account
- [ ] Do you have a Vercel account? (Free signup at vercel.com)
- [ ] Do you have a **GitHub account**? (Vercel deploys from GitHub)
- [ ] What is your **domain name**? (e.g., `saptahiksamachar.com.np`)

### 3. Email (For Auth)
- [ ] What email will you use for the **admin login**?
- [ ] Do you want me to set up **email/password auth** or **magic link** (passwordless)?

### 4. Storage
- [ ] Have you created the `news-images` bucket in Supabase Storage? (Public)

---

## 🔧 STEP-BY-STEP DEPLOYMENT

### STEP 1: Supabase Setup (10 minutes)

#### 1.1 Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Name: `saptahik-samachar`
4. Database Password: (save this somewhere safe)
5. Region: Choose closest to Nepal (Singapore or Mumbai)
6. Click "Create New Project"

#### 1.2 Run Database Schema
1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy ALL contents from `schema.sql` file
4. Paste into the editor
5. Click **Run**
6. ✅ You should see "Success" and 10 categories inserted

#### 1.3 Get API Keys
1. Click **Project Settings** (gear icon, bottom left)
2. Click **API**
3. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

#### 1.4 Set Up Storage Bucket
1. Click **Storage** (left sidebar)
2. Click **New Bucket**
3. Name: `news-images`
4. Check: **Public bucket**
5. Click **Save**
6. Click on `news-images` bucket
7. Click **Policies** tab
8. Under "Other policies under storage.objects", click **New Policy**
9. Policy name: `Public Read`
10. Allowed operation: `SELECT`
11. Target roles: `anon`, `authenticated`
12. Policy definition: `true`
13. Click **Save Policy**
14. Add another policy:
    - Name: `Authenticated Upload`
    - Allowed operation: `INSERT`
    - Target roles: `authenticated`
    - Policy definition: `auth.role() = 'authenticated'`
    - Click **Save**

#### 1.5 Enable Auth (Email)
1. Click **Authentication** (left sidebar)
2. Click **Providers**
3. Find **Email** provider
4. Make sure it's **Enabled**
5. Disable "Confirm email" if you want instant login (or keep it for security)
6. Click **Save**

#### 1.6 Create Admin User
1. Click **Authentication** → **Users**
2. Click **Add User**
3. Enter your admin email and password
4. Click **Create User**

---

### STEP 2: Environment Variables (2 minutes)

In your project folder, create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
CLEANUP_SECRET_KEY=any-random-secret-string-here
```

**Never share or commit this file!**

---

### STEP 3: Test Locally (5 minutes)

```bash
cd saptahik-samachar
npm install
npm run dev
```

Open http://localhost:3000

Test:
1. Homepage loads ✅
2. Login page works (/login) ✅
3. Admin dashboard loads after login ✅
4. You can write and publish an article ✅

---

### STEP 4: Deploy to Vercel (5 minutes)

#### 4.1 Push to GitHub
1. Create a new repository on GitHub (private or public)
2. In your project folder:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### 4.2 Connect to Vercel
1. Go to https://vercel.com
2. Click **Add New Project**
3. Import your GitHub repository
4. Framework Preset: **Next.js**
5. Click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
   - `CLEANUP_SECRET_KEY` = any random string
6. Click **Deploy**
7. Wait 2-3 minutes
8. ✅ Your site is live!

---

### STEP 5: Custom Domain (5 minutes)

#### 5.1 In Vercel Dashboard
1. Click your project
2. Click **Settings** tab
3. Click **Domains**
4. Enter your domain: `saptahiksamachar.com.np`
5. Click **Add**

#### 5.2 In Hostinger (or your domain provider)
1. Go to your domain DNS settings
2. Add a **CNAME record**:
   - Name: `www` or `@`
   - Value: `cname.vercel-dns.com`
3. Wait 5-30 minutes for DNS to propagate
4. Back in Vercel, click **Verify**
5. ✅ Domain connected!

---

### STEP 6: Set Up Auto-Cleanup (3 minutes)

To keep Supabase free tier awake and auto-delete old images:

1. Go to https://cron-job.org (free)
2. Sign up
3. Click **Create cronjob**
4. Title: `Saptahik Samachar Cleanup`
5. Address: `https://YOUR_VERCEL_URL.vercel.app/api/cleanup?key=YOUR_SECRET_KEY`
6. Schedule: Every 3 days
7. Click **Create**
8. ✅ Auto-cleanup is set!

---

## 🎯 AFTER DEPLOYMENT

### First Things To Do
1. **Log in to admin** (/login) with your email/password
2. **Write your first article** (/admin/write)
3. **Upload an ad** (/admin/ads) to test the system
4. **Share your site** on Facebook/WhatsApp

### Monitoring
- **Vercel Analytics**: Built-in, free
- **Supabase Usage**: Check dashboard weekly
- **Image Storage**: If approaching 1GB, consider upgrading or enabling stricter cleanup

---

## 🆘 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install` again |
| "Invalid API key" | Check `.env.local` values |
| "Bucket not found" | Create `news-images` bucket in Supabase |
| "Upload failed" | Check storage policies (must allow authenticated INSERT) |
| "404 on article" | Make sure article status is "published" |
| "Styles not loading" | Check if Tailwind CSS is compiled (`npm run build`) |
| "Domain not working" | Wait 30 min for DNS, check CNAME record |

---

## 📞 SUPPORT

If anything breaks:
1. Check browser console (F12 → Console)
2. Check Vercel deployment logs
3. Check Supabase logs (Database → Logs)
4. Send me the error message and I'll fix the code

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Supabase project created
- [ ] SQL schema executed (10 categories)
- [ ] Storage bucket `news-images` created (Public)
- [ ] Storage policies set (SELECT for all, INSERT for authenticated)
- [ ] Email auth enabled
- [ ] Admin user created
- [ ] `.env.local` file created with all 4 variables
- [ ] Local test passed (`npm run dev` works)
- [ ] GitHub repository created
- [ ] Vercel project deployed
- [ ] Environment variables added in Vercel
- [ ] Custom domain connected
- [ ] Cron job set up (cron-job.org)
- [ ] First article published ✅

---

**Send me your Supabase URL and keys when you're ready, and I'll verify everything is correct!**
