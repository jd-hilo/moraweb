import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually since we're in Node
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectProfilesTable() {
  console.log('Inspecting profiles table structure...\n');
  console.log('Supabase URL:', supabaseUrl);
  console.log('');

  // Based on the migration file and common patterns, test these columns
  const columnsToTest = [
    // From migration file
    'id', 'user_id', 'email', 'first_name', 'birth_year', 'hometown', 
    'university', 'onboarding_complete', 'has_paid', 'created_at', 'updated_at',
    // Common variations
    'last_name', 'full_name', 'phone', 'avatar_url', 'profile_picture',
    'onboarding_data', 'metadata', 'data', 'responses', 'values_json', 'ai_summary'
  ];

  console.log('Testing columns to determine table structure...\n');
  const foundColumns = [];
  const missingColumns = [];

  for (const col of columnsToTest) {
    try {
      // Try to select this column (limit 0 to avoid fetching data)
      const { error } = await supabase
        .from('profiles')
        .select(col)
        .limit(0);
      
      if (!error) {
        foundColumns.push(col);
        console.log(`✅ ${col}`);
      } else {
        // Check if it's a "column doesn't exist" error vs other error
        if (error.code === '42703' || error.message.includes('column') || error.message.includes('does not exist')) {
          missingColumns.push(col);
          // Don't log missing columns to reduce noise
        } else {
          // Other error (like RLS), but column might exist
          foundColumns.push(col);
          console.log(`✅ ${col} (accessible)`);
        }
      }
    } catch (err) {
      missingColumns.push(col);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📋 PROFILES TABLE STRUCTURE SUMMARY:`);
  console.log('='.repeat(60));
  
  if (foundColumns.length > 0) {
    console.log(`\n✅ Found ${foundColumns.length} column(s):\n`);
    foundColumns.forEach(col => {
      console.log(`  - ${col}`);
    });
  } else {
    console.log('\n⚠️  Could not determine columns (may need authentication or RLS is blocking)');
  }

  if (missingColumns.length > 0 && foundColumns.length > 0) {
    console.log(`\n❌ Not found (${missingColumns.length} tested):`);
    missingColumns.slice(0, 10).forEach(col => console.log(`  - ${col}`));
    if (missingColumns.length > 10) {
      console.log(`  ... and ${missingColumns.length - 10} more`);
    }
  }

  // Try to get more info by attempting a select with all found columns
  if (foundColumns.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Attempting full query with found columns...\n');
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select(foundColumns.join(', '))
        .limit(1);

      if (error) {
        console.log(`Query error: ${error.message}`);
      } else {
        console.log(`✅ Query successful`);
        if (count !== null) {
          console.log(`Total rows: ${count}`);
        }
        if (data && data.length > 0) {
          console.log('\nSample row:');
          console.log(JSON.stringify(data[0], null, 2));
        }
      }
    } catch (err) {
      console.log(`Query exception: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
}

inspectProfilesTable().catch(console.error);
