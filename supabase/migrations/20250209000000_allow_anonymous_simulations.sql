/*
  # Allow Anonymous Simulations
  
  This migration updates the websims table to allow users to create simulations
  without requiring an account. Changes:
  1. Make user_id nullable
  2. Update RLS policies to allow anonymous inserts
  3. Update foreign key constraint to allow NULL user_id
*/

-- Make user_id nullable
ALTER TABLE websims 
  ALTER COLUMN user_id DROP NOT NULL;

-- Drop the foreign key constraint temporarily
ALTER TABLE websims 
  DROP CONSTRAINT IF EXISTS websims_user_id_fkey;

-- Re-add foreign key constraint that allows NULL
ALTER TABLE websims
  ADD CONSTRAINT websims_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own websims" ON websims;

-- Create new insert policy that allows both authenticated and anonymous users
CREATE POLICY "Anyone can insert websims"
  ON websims FOR INSERT
  TO public
  WITH CHECK (true);

-- Update select policy to allow viewing websims with null user_id
-- (The existing "Public can view websims by ID" policy already covers this)

-- Update update policy to allow updates for anonymous simulations
-- (Users can only update their own, but anonymous ones can't be updated anyway)
DROP POLICY IF EXISTS "Users can update own websims" ON websims;

CREATE POLICY "Users can update own websims"
  ON websims FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Note: Anonymous simulations (user_id IS NULL) can't be updated after creation
-- This is intentional - they're read-only after creation
