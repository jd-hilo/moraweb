-- Create investor_leads table
CREATE TABLE IF NOT EXISTS investor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  firm_name text,
  aum_stage text,
  primary_focus text,
  website_link text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE investor_leads ENABLE ROW LEVEL SECURITY;

-- Allow public to insert leads (since it's a landing page form)
CREATE POLICY "Anyone can insert investor leads"
  ON investor_leads FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated admins (or nobody for now) can view leads
-- For now, let's just keep it restricted to service role or manual DB access
CREATE POLICY "Leads are not publicly viewable"
  ON investor_leads FOR SELECT
  TO authenticated
  USING (false);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_investor_leads_email ON investor_leads(email);
