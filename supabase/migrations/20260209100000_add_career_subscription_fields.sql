-- Create profiles table if it doesn't exist (used by auth, payments, career Pro)
-- profiles.user_id matches auth.users from Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  hometown text,
  university text,
  core_json jsonb DEFAULT '{}'::jsonb,
  values_json jsonb DEFAULT '[]'::jsonb,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can read/update own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow service role / anon for server-side operations if needed
-- (Supabase trigger may insert on signup - adjust if your auth setup differs)

-- Add Career Simulation Pro subscription fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for Career Pro subscription';
COMMENT ON COLUMN profiles.subscription_status IS 'active, trialing, canceled, past_due, etc.';
COMMENT ON COLUMN profiles.subscription_ends_at IS 'When subscription/trial ends';
