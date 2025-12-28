/*
  # Create websims table for web-generated simulations

  This table stores simulations generated from the web app.
  It's separate from the mobile app's simulations table to allow
  different access controls and public sharing.
*/

-- Create websims table
CREATE TABLE IF NOT EXISTS websims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scenarios jsonb DEFAULT '{}'::jsonb,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE websims ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own simulations
CREATE POLICY "Users can view own websims"
  ON websims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own simulations
CREATE POLICY "Users can insert own websims"
  ON websims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own simulations
CREATE POLICY "Users can update own websims"
  ON websims FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own simulations
CREATE POLICY "Users can delete own websims"
  ON websims FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Public can view websims by ID (for sharing)
CREATE POLICY "Public can view websims by ID"
  ON websims FOR SELECT
  TO public
  USING (true);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_websims_user_id ON websims(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_websims_created_at ON websims(created_at DESC);


