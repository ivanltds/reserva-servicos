import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load env from .env.local
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim();
    if (key.startsWith("NEXT_PUBLIC_") || key.startsWith("SUPABASE_")) {
      env[key] = val;
    }
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching auth users...");
  const { data: { users } } = await supabase.auth.admin.listUsers();
  console.log("Auth users:", users.map(u => ({ id: u.id, email: u.email, email_confirmed_at: u.email_confirmed_at })));

  console.log("\nFetching public.profiles...");
  const { data: profiles, error: pErr } = await supabase.from("profiles").select("*");
  if (pErr) console.error("Error fetching profiles:", pErr);
  else console.log("Profiles in DB:", profiles);
}

run();
