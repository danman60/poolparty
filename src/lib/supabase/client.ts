"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getBrowserSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase env not set; returning null client");
    return null as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

