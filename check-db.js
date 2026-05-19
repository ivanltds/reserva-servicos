import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read env variables manually from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    console.log("Checking database...");
    const { data, error } = await supabase.from('service_items').select('*').limit(1);
    if (error) {
      console.log("Error querying service_items:", error.message);
    } else {
      console.log("service_items exists! Sample data:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
