-- Add simulation_type column to websims table for distinguishing career simulations
-- This allows filtering and querying by simulation type

DO $$
BEGIN
  -- Add simulation_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'websims' AND column_name = 'simulation_type'
  ) THEN
    ALTER TABLE websims ADD COLUMN simulation_type TEXT DEFAULT 'life';
  END IF;
END $$;

-- Add index for querying by simulation type
CREATE INDEX IF NOT EXISTS idx_websims_simulation_type ON websims(simulation_type);

-- Comment for documentation
COMMENT ON COLUMN websims.simulation_type IS 'Type of simulation: life, career, relationship, social';
