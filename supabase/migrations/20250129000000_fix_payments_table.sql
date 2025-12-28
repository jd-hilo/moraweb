-- Fix payments table to reference auth.users and update amount
-- This migration updates the payments table to work correctly with Supabase auth

-- Check if payments table exists, if not create it
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  simulation_id uuid,
  amount numeric(10, 2) DEFAULT 7.99 NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  stripe_payment_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

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

-- Add foreign key to simulations if table exists (optional)
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

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;

-- Create payments policies
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
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_simulation_id ON payments(simulation_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_id ON payments(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

