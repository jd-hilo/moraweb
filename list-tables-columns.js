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

async function listTablesAndColumns() {
  console.log('Querying all tables and their columns...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('\n' + '='.repeat(80));

  // SQL query to get all tables with their columns
  const tablesQuery = `
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
  `;

  console.log('\nSQL Query to run in Supabase SQL Editor:');
  console.log('='.repeat(80));
  console.log(tablesQuery);
  console.log('='.repeat(80));

  // Try to get tables first
  console.log('\n\nAttempting to query via Supabase client...\n');
  
  // Since we can't directly query information_schema via Supabase client,
  // we'll try to infer by testing known tables
  const knownTables = ['profiles', 'simulations', 'users', 'onboarding_responses', 'payments'];
  
  const results = {};
  
  for (const tableName of knownTables) {
    console.log(`Testing table: ${tableName}...`);
    
    // Try to query the table to see if it exists and get structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    if (!error) {
      results[tableName] = { exists: true, columns: [] };
      console.log(`  ✅ Table exists`);
      
      // Try common columns
      const commonColumns = [
        'id', 'user_id', 'email', 'first_name', 'last_name', 'full_name',
        'birth_year', 'birth_date', 'age', 'hometown', 'city', 'location',
        'university', 'college', 'education', 'onboarding_complete',
        'has_paid', 'paid', 'created_at', 'updated_at', 'phone',
        'avatar_url', 'profile_picture', 'metadata', 'data', 'responses',
        'values_json', 'ai_summary', 'simulation_type', 'simulation_data',
        'is_unlocked', 'amount', 'status', 'stripe_payment_id'
      ];
      
      for (const col of commonColumns) {
        const { error: colError } = await supabase
          .from(tableName)
          .select(col)
          .limit(0);
        
        if (!colError) {
          results[tableName].columns.push(col);
        }
      }
    } else {
      if (error.code === 'PGRST116' || error.code === 'PGRST205') {
        results[tableName] = { exists: false };
        console.log(`  ❌ Table does not exist`);
      } else {
        results[tableName] = { exists: true, error: error.message };
        console.log(`  ⚠️  Table exists but error: ${error.message}`);
      }
    }
  }

  // Print results
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TABLES AND COLUMNS SUMMARY:\n');
  console.log('='.repeat(80));

  for (const [tableName, info] of Object.entries(results)) {
    if (info.exists) {
      console.log(`\n📋 Table: ${tableName}`);
      if (info.columns && info.columns.length > 0) {
        console.log(`   Columns (${info.columns.length}):`);
        info.columns.forEach(col => {
          console.log(`     - ${col}`);
        });
      } else if (info.error) {
        console.log(`   ⚠️  ${info.error}`);
      } else {
        console.log(`   ⚠️  Could not determine columns (table is empty or RLS blocking)`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 To get complete column details (data types, nullability, etc.),');
  console.log('   run the SQL query above in Supabase SQL Editor.');
  console.log('='.repeat(80));
}

listTablesAndColumns().catch(console.error);



