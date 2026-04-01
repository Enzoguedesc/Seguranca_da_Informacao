// ═══════════════════════════════════════════════
// supabase.js — Cliente e configuração Supabase
// ═══════════════════════════════════════════════

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ⚠️ SUBSTITUA com suas credenciais do Supabase
const SUPABASE_URL = 'https://cynpcmlnzzsgdrobxrlc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bnBjbWxuenpzZ2Ryb2J4cmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTk1MDQsImV4cCI6MjA5MDE3NTUwNH0.YTEFxrMjB3q6FpbCC_YvnR3-9L1WTm_7l3PSKpNepMA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// Verificar conexão
export async function checkConnection() {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}
