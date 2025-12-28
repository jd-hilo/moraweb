import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  console.log('Querying all tables in public schema...\n');

  // SQL query to list all tables
  const query = `
    SELECT 
      table_name,
      table_schema
    FROM 
      information_schema.tables
    WHERE 
      table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY 
      table_name;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: query });
    
    if (error) {
      // Try alternative: direct query via REST API
      console.log('Trying alternative method...\n');
      
      // Use PostgREST to query information_schema
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');

      if (tablesError) {
        console.log('Error:', tablesError.message);
        console.log('\nSQL Query to run in Supabase SQL Editor:');
        console.log('='.repeat(60));
        console.log(query);
        console.log('='.repeat(60));
      } else {
        console.log('Tables found:');
        if (tablesData && tablesData.length > 0) {
          tablesData.forEach(table => {
            console.log(`  - ${table.table_name}`);
          });
        } else {
          console.log('  No tables found');
        }
      }
    } else {
      console.log('Tables found:');
      if (data && data.length > 0) {
        data.forEach(table => {
          console.log(`  - ${table.table_name}`);
        });
      } else {
        console.log('  No tables found');
      }
    }
  } catch (err) {
    console.log('Error executing query:', err.message);
    console.log('\nSQL Query to run in Supabase SQL Editor:');
    console.log('='.repeat(60));
    console.log(query);
    console.log('='.repeat(60));
  }
}

listTables().catch(console.error);


