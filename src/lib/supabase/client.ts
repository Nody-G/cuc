import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYmtjc3lwZnR2c3Bta2ZucmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDEzMTgsImV4cCI6MjA5ODY3NzMxOH0.Temk6Y9gSqHyG6psq7rZ745t16QDNKDGsBfSkStnbew';

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
