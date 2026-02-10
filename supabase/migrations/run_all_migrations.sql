/*
  # Complete Database Schema Migration
  
  Run this file in your new Supabase project's SQL Editor to set up all tables.
  This consolidates all migrations into one file for easy setup.
  
  Run order:
  1. Create onboarding tables (users, onboarding_responses, simulations, payments)
  2. Create websims table
  3. Fix payments table (updates foreign keys and constraints)
  4. Create investor_leads table
*/

-- ============================================================================
-- PART 1: Create Onboarding and Digital Twin System Tables
-- ============================================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  first_name text,
  birth_year integer,
  hometown text,
  university text,
  onboarding_complete boolean DEFAULT false,
  has_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create onboarding_responses table
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  responses jsonb DEFAULT '{}'::jsonb,
  values_json jsonb DEFAULT '[]'::jsonb,
  ai_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create simulations table
CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  simulation_type text DEFAULT 'life',
  simulation_data jsonb DEFAULT '{}'::jsonb,
  is_unlocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create payments table (initial version)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  simulation_id uuid,
  amount numeric(10, 2) DEFAULT 4.99,
  status text DEFAULT 'pending',
  stripe_payment_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Onboarding responses policies
DROP POLICY IF EXISTS "Users can view own responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON onboarding_responses;
DROP POLICY IF EXISTS "Users can update own responses" ON onboarding_responses;

CREATE POLICY "Users can view own responses"
  ON onboarding_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own responses"
  ON onboarding_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own responses"
  ON onboarding_responses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Simulations policies
DROP POLICY IF EXISTS "Users can view own simulations" ON simulations;
DROP POLICY IF EXISTS "Users can insert own simulations" ON simulations;
DROP POLICY IF EXISTS "Users can update own simulations" ON simulations;

CREATE POLICY "Users can view own simulations"
  ON simulations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own simulations"
  ON simulations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own simulations"
  ON simulations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Payments policies (initial)
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user_id ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_simulation_id ON payments(simulation_id);

-- ============================================================================
-- PART 2: Create websims table
-- ============================================================================

-- Create websims table (user_id is nullable to allow anonymous simulations)
CREATE TABLE IF NOT EXISTS websims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scenarios jsonb DEFAULT '{}'::jsonb,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Make user_id nullable (allows anonymous simulations)
ALTER TABLE websims 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE websims ENABLE ROW LEVEL SECURITY;

-- Make user_id nullable (allows anonymous simulations)
-- Note: This will fail if table already exists with NOT NULL constraint, but that's OK
-- The separate migration handles existing databases
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'websims' 
    AND column_name = 'user_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE websims ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own websims" ON websims;
DROP POLICY IF EXISTS "Users can insert own websims" ON websims;
DROP POLICY IF EXISTS "Anyone can insert websims" ON websims;
DROP POLICY IF EXISTS "Users can update own websims" ON websims;
DROP POLICY IF EXISTS "Users can delete own websims" ON websims;
DROP POLICY IF EXISTS "Public can view websims by ID" ON websims;

-- Allow authenticated users to view their own websims
CREATE POLICY "Users can view own websims"
  ON websims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anyone (authenticated or anonymous) to insert websims
CREATE POLICY "Anyone can insert websims"
  ON websims FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to update their own websims
CREATE POLICY "Users can update own websims"
  ON websims FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to delete their own websims
CREATE POLICY "Users can delete own websims"
  ON websims FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow public to view websims by ID (for sharing)
CREATE POLICY "Public can view websims by ID"
  ON websims FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_websims_user_id ON websims(user_id);
CREATE INDEX IF NOT EXISTS idx_websims_created_at ON websims(created_at DESC);

-- Add simulation_type column for career vs life simulations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websims' AND column_name = 'simulation_type'
  ) THEN
    ALTER TABLE websims ADD COLUMN simulation_type TEXT DEFAULT 'life';
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_websims_simulation_type ON websims(simulation_type);

-- ============================================================================
-- PART 3: Fix payments table (update foreign keys and constraints)
-- ============================================================================

-- Drop existing foreign key constraints if they exist
ALTER TABLE payments 
  DROP CONSTRAINT IF EXISTS payments_user_id_fkey,
  DROP CONSTRAINT IF EXISTS payments_simulation_id_fkey;

-- Add correct foreign key to auth.users
ALTER TABLE payments
  ADD CONSTRAINT payments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Add foreign key to simulations if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'simulations') THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_simulation_id_fkey 
      FOREIGN KEY (simulation_id) 
      REFERENCES simulations(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- Update default amount to 7.99 for new rows
ALTER TABLE payments 
  ALTER COLUMN amount SET DEFAULT 7.99;

-- Add unique constraint on stripe_payment_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_stripe_payment_id_key'
  ) THEN
    ALTER TABLE payments 
      ADD CONSTRAINT payments_stripe_payment_id_key 
      UNIQUE (stripe_payment_id);
  END IF;
END $$;

-- Update payments policies to use auth.uid()
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create additional indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_id ON payments(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- ============================================================================
-- PART 4: Create investor_leads table
-- ============================================================================

CREATE TABLE IF NOT EXISTS investor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  firm_name text,
  aum_stage text,
  primary_focus text,
  website_link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investor_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert investor leads" ON investor_leads;
DROP POLICY IF EXISTS "Leads are not publicly viewable" ON investor_leads;

CREATE POLICY "Anyone can insert investor leads"
  ON investor_leads FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Leads are not publicly viewable"
  ON investor_leads FOR SELECT
  TO authenticated
  USING (false);

CREATE INDEX IF NOT EXISTS idx_investor_leads_email ON investor_leads(email);

-- ============================================================================
-- 20260209100000: Create profiles table (if missing) + Career Pro subscription fields
-- profiles.user_id references auth.users from Supabase Auth
-- ============================================================================
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz DEFAULT NULL;

-- ============================================================================
-- Migration Complete!
-- ============================================================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'onboarding_responses', 'simulations', 'payments', 'websims', 'investor_leads')
ORDER BY tablename;
