-- Query to get all tables and their columns with details
-- Run this in Supabase SQL Editor

SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default,
  c.ordinal_position
FROM 
  information_schema.tables t
LEFT JOIN 
  information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
WHERE 
  t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY 
  t.table_name, c.ordinal_position;

-- Alternative: Get tables and columns in a more readable format
SELECT 
  table_name,
  json_agg(
    json_build_object(
      'column_name', column_name,
      'data_type', data_type,
      'is_nullable', is_nullable,
      'column_default', column_default
    ) ORDER BY ordinal_position
  ) as columns
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public'
GROUP BY 
  table_name
ORDER BY 
  table_name;


