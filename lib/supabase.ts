import { createClient } from '@supabase/supabase-js';

// We check for environment variables.
// In a real scenario, these would be populated.
// Since we are generating a standalone demo, we will handle the "missing key" case gracefully in storage.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'expenses',
    },
  })
  : null;

export const isSupabaseConfigured = () => !!supabase;