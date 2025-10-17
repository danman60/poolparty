import 'server-only';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

export function getServerSupabase() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null as any;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: { headers: { 'x-application-name': 'poolparty' } },
    db: { schema: 'poolparty' },
  });
}
