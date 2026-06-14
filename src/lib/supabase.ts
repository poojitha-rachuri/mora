import { createClient } from '@supabase/supabase-js';

// Strip BOM (U+FEFF) that can appear when env vars are copy-pasted from certain editors
function cleanEnv(val: string | undefined): string {
  return (val ?? '').replace(/^﻿/, '').trim();
}

export function createServerClient() {
  return createClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export function createBrowserClient() {
  return createClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
