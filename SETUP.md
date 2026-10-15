# InfraTrace - Backend Setup & Database Seeding Guide

This guide details the exact steps to configure your Supabase backend, execute the SQL schema with Row-Level Security (RLS), configure Auth settings to avoid email rate limits, and run the automated seed script to populate demo accounts and 30 realistic Nashik infrastructure records.

---

## Prerequisites
- **Node.js** (v18+ or v20+)
- A **Supabase** project ([supabase.com](https://supabase.com))

---

## ⚠️ Important Development Note: "Confirm Email" & Rate Limits

By default, free-tier Supabase projects enforce strict email rate limits (~3-4 confirmation emails per hour). Attempting multiple signups with email confirmation enabled will trigger `email rate limit exceeded`.

👉 **In Development, disable Email Confirmation**:
1. Open your **Supabase Dashboard**.
2. Go to **Authentication** -> **Providers** -> **Email**.
3. Toggle **Confirm email** to **OFF** (Disabled).
4. Click **Save**.

*When Confirm email is OFF, new user signups via the app will succeed immediately and take the user straight to `/user/dashboard`.*

---

## Step 1: Run the Database Schema & Triggers

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Click **New Query**.
3. Copy and run the entire contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Next, copy and run [`supabase/auth_trigger.sql`](./supabase/auth_trigger.sql) to enable automatic `users_profile` creation on new signups.

### What this creates:
- **Tables**: `users_profile`, `verifiers`, `admins`, `utilities`, and `record_events`.
- **Security Definer Functions**: `is_admin()` and `is_verifier()`.
- **Automatic Triggers**:
  - `trigger_set_utility_record_id`: Auto-generates type-based IDs (`WTR-`, `ELC-`, `GAS-`, `SWR-`, `TEL-`).
  - `on_auth_user_created`: Auto-creates `users_profile` whenever a user signs up.
- **Row Level Security (RLS)**: Enforces table policies for Admins, Verifiers, and Users.

---

## Step 2: Configure Environment Variables

1. Copy the example environment template:
   ```bash
   cp .env.example .env
   ```

2. In your Supabase Dashboard, go to **Project Settings** -> **API**:
   - Copy **Project URL** -> `VITE_SUPABASE_URL`
   - Copy **Project API Keys (`anon` / `public`)** -> `VITE_SUPABASE_ANON_KEY`
   - Copy **Project API Keys (`service_role` / `secret`)** -> `SUPABASE_SERVICE_ROLE_KEY`

3. Create or update your `.env` (used by Vite) and `.env.local` (used by the seed script):

   **`.env`**:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   **`.env.local`**:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
   ```

> 🔒 **Security Notice**: `SUPABASE_SERVICE_ROLE_KEY` is strictly for backend maintenance (`scripts/seed.mjs`) and is **never** bundled or accessible in the client browser. Both `.env` and `.env.local` are ignored by git.

---

## Step 3: Run the Automated Seed Script

Execute the seed script locally from your terminal:

```bash
npm run seed
```

### What the seed script provisions:
1. **Creates Demo Accounts** (idempotently with confirmed status):
   - 👑 **Admin**: `admin@infratrace.com` / `Admin@123456` *(Infrastructure Management)*
   - 🔍 **Verifier**: `verifier@infratrace.com` / `Verify@123456` *(Inspection & Verification)*
   - 👷 **User**: `user@infratrace.com` / `User@123456` *(Civil Engineer)*
2. **Inserts 30 Nashik Utility Records**:
   - Covers all 5 utility domains: `water`, `electricity`, `gas`, `sewage`, and `telecom`.
   - Covers all 3 statuses: `Verified`, `Pending`, and `Rejected` (with detailed rejection reasons).
   - Real GIS coordinates bounded within Nashik urban territory (Lat `19.9` - `20.1`, Lng `73.7` - `73.9`).
   - Includes benchmark record: `WTR-2041` (*"12-inch Water Main, Gangapur Road"* as Verified).
3. **Creates Status Timeline Events** in `record_events` for full lifecycle history.

---

## Step 4: Admin-Created Accounts & Role Management

Public registration creates standard **User** accounts (`users_profile`). To create or promote Verifiers and Admins:

### Option A: Promote an existing registered User via SQL
Run this in the Supabase SQL editor:
```sql
-- Promote to Verifier:
INSERT INTO public.verifiers (id, email, full_name, department)
SELECT id, email, full_name, 'Municipal Inspection & Verification'
FROM public.users_profile
WHERE email = 'colleague@infratrace.com'
ON CONFLICT (id) DO UPDATE SET department = EXCLUDED.department;

-- Promote to Admin:
INSERT INTO public.admins (id, email, full_name, department)
SELECT id, email, full_name, 'Infrastructure Management'
FROM public.users_profile
WHERE email = 'director@infratrace.com'
ON CONFLICT (id) DO UPDATE SET department = EXCLUDED.department;
```

### Option B: Use the Seed Script
Add additional staff to `DEMO_USERS` in [`scripts/seed.mjs`](./scripts/seed.mjs) and run `npm run seed`.

---

## Step 5: Start the Development Server

Launch the web application:

```bash
npm run dev
```

Open the application at `http://localhost:5173`.
