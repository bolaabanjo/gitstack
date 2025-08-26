import { createClient } from '@supabase/supabase-js';

// Uses the public keys for the browser/client. For server-side code that
// requires elevated privileges, a separate service-role client should be used
// with an environment variable that is NOT exposed to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Not throwing to avoid breaking non-runtime static analysis. Tests or CI
  // should set these env vars when necessary.
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase client created without NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
