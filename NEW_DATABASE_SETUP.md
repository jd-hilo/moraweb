# Setting Up a New Database

This guide will help you connect to a new Supabase database instead of your existing one.

## Step 1: Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: Choose a name for your project
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

4. Wait for the project to be created (takes ~2 minutes)

## Step 2: Get Your New Database Credentials

1. In your new Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Update Environment Variables

Update your `.env` file with the new credentials:

```bash
VITE_SUPABASE_URL=https://your-new-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key_here
```

**Important**: Keep your other environment variables (Claude API key, Stripe keys, etc.) - only update the Supabase ones.

## Step 4: Run Migrations on New Database

You have two options:

### Option A: Use Supabase Dashboard (Easiest)

1. Go to your new Supabase project
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/run_all_migrations.sql` (we'll create this)
4. Click **Run** to execute all migrations

### Option B: Use Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Link to your new project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push
```

## Step 5: Verify Setup

1. In Supabase Dashboard, go to **Table Editor**
2. You should see these tables:
   - `users`
   - `onboarding_responses`
   - `simulations`
   - `payments`
   - `websims`
   - `investor_leads`

3. Test your app locally:
   ```bash
   npm run dev
   ```

## Step 6: Update Production Environment Variables

If you've deployed your app, update environment variables in:
- **Vercel**: Settings → Environment Variables
- **Railway**: Variables tab
- **Render**: Environment section

Don't forget to **redeploy** after updating environment variables!

---

## Troubleshooting

**"Missing Supabase environment variables" error?**
- Make sure `.env` file exists in project root
- Check that variable names start with `VITE_`
- Restart your dev server after changing `.env`

**Migrations failing?**
- Make sure you're running them in order
- Check Supabase SQL Editor for error messages
- Some migrations depend on others (run them sequentially)

**Can't connect to database?**
- Verify your `VITE_SUPABASE_URL` is correct
- Check that your `VITE_SUPABASE_ANON_KEY` is the anon/public key (not service role key)
- Ensure your Supabase project is active (not paused)
