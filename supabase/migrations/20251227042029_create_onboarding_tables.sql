/*
  # Create Onboarding and Digital Twin System Tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `email` (text, unique) - User email address
      - `first_name` (text) - User's first name
      - `birth_year` (integer) - Year user was born
      - `hometown` (text) - Where user grew up
      - `university` (text) - College/university attended
      - `onboarding_complete` (boolean) - Onboarding completion status
      - `has_paid` (boolean) - Payment status for simulation unlock
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `onboarding_responses`
      - `id` (uuid, primary key) - Unique response record identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `responses` (jsonb) - All onboarding answers stored as JSON
      - `values_json` (jsonb) - Selected values array
      - `ai_summary` (text) - AI-generated personality summary
      - `created_at` (timestamptz) - Response creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `simulations`
      - `id` (uuid, primary key) - Unique simulation identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `simulation_type` (text) - Type of simulation (life, decision, etc.)
      - `simulation_data` (jsonb) - Complete simulation results
      - `is_unlocked` (boolean) - Whether user has paid to unlock
      - `created_at` (timestamptz) - Simulation creation timestamp

    - `payments`
      - `id` (uuid, primary key) - Unique payment identifier
      - `user_id` (uuid, foreign key) - Reference to users table
      - `simulation_id` (uuid, foreign key) - Reference to simulations table
      - `amount` (numeric) - Payment amount (4.99)
      - `status` (text) - Payment status (pending, completed, failed)
      - `stripe_payment_id` (text) - Stripe payment identifier
      - `created_at` (timestamptz) - Payment creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Restrict access to other users' data
*/

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

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  simulation_id uuid REFERENCES simulations(id) ON DELETE SET NULL,
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

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user_id ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_simulation_id ON payments(simulation_id);