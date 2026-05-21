# 👔 Gents Collection — Store Manager

A **mobile-first** staff & payroll management app built with **Next.js 14 + TypeScript + Tailwind CSS + Supabase**.

## 🚀 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) + TypeScript | Fast, type-safe |
| Styling | Tailwind CSS | Rapid, responsive |
| Backend | **Supabase** (FREE) | PostgreSQL + Auth + API |
| Hosting | Vercel (FREE) | Best Next.js deployment |

---

## ⚡ Setup Guide

### Step 1 — Create Supabase Project
1. Go to **https://supabase.com** → Create account → New project
2. Name it `gents-store-manager`, set a strong database password
3. Wait ~2 minutes for project to provision

### Step 2 — Run the Database Schema
1. In Supabase dashboard → **SQL Editor** → New Query
2. Copy/paste all contents from `supabase/schema.sql`
3. Click **Run**

### Step 3 — Get Your API Keys
1. Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret!)*

### Step 4 — Configure Environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Step 5 — Create Admin Owner Account
1. Supabase dashboard → **Authentication** → **Users** → **Add user**
2. Enter your email + password → **Create user**
3. Copy the **User UUID** shown
4. Go to **SQL Editor** and run:
```sql
INSERT INTO profiles (id, full_name, email, role, monthly_salary, joining_date)
VALUES (
  'PASTE-YOUR-UUID-HERE',
  'Your Name',
  'your@email.com',
  'admin',
  0,
  '2024-01-01'
);
```

### Step 6 — Install & Run
```bash
npm install
npm run dev
```
Open **http://localhost:3000** → login with your admin credentials.

---

## 📱 Install on iPhone (PWA)

1. Deploy to Vercel: `npx vercel` or push to GitHub → connect on vercel.com
2. Open your Vercel URL in **Safari** on iPhone
3. Tap **Share** → **Add to Home Screen**
4. The app installs like a native app — full screen, no browser chrome!

---

## 🏗️ Features

### 👑 Admin (Owner)
- **Dashboard** — Today's attendance overview, stats
- **Staff Management** — Add/edit/deactivate staff (CRUD)
- **Attendance** — Mark present/absent + check-in/out times per day
- **Salary** — Monthly breakdown per staff: base + allowance - advances
- **Advance Payments** — Deduct salary advances with reason tracking

### 👷 Staff
- **Dashboard** — Today's status, weekly calendar, month summary
- **My Salary** — Monthly breakdown: base salary, daily allowances, advances, net pay
- **Multi-month** — Navigate to past months to see history

---

## 💰 Salary Calculation

```
Net Salary = Base Salary + (Days Present × ₹30) - Advance Deductions
```

- Daily allowance: **₹30/day** (tea & snacks)
- Total staff budget: **₹14,000/month** (distributed across 6 staff)
- Store hours: **9:30 AM – 10:30 PM, all 7 days**

---

## 🗂️ Project Structure

```
store-manager/
├── app/
│   ├── login/          # Login page
│   ├── admin/          # Admin routes (protected)
│   │   ├── dashboard/  # Overview & today's log
│   │   ├── staff/      # CRUD staff members
│   │   ├── attendance/ # Daily attendance marking
│   │   └── salary/     # Monthly salary + advances
│   ├── staff/          # Staff routes (protected)
│   │   ├── dashboard/  # Personal overview
│   │   └── salary/     # My salary details
│   └── api/staff/      # Server API routes
├── components/
│   ├── layout/         # AdminNav, StaffNav
│   └── ui/             # StatCard, reusable components
├── lib/                # Supabase client, utils
├── types/              # TypeScript types
└── supabase/
    └── schema.sql      # Full database schema
```

---

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- Staff can ONLY see their own data
- Admin routes protected via Next.js middleware
- Service role key used only server-side (API routes)
- Passwords handled entirely by Supabase Auth

---

## 📦 Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables → add all 3 keys
```
