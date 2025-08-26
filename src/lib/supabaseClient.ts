import { createClient } from '@supabase/supabase-js';

// Uses the public keys for the browser/client. For server-side code that
// requires elevated privileges, a separate service-role client should be used
// with an environment variable that is NOT exposed to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // If env vars are missing we expose a lightweight stub implementing
  // the small supabase.auth surface the app uses. This prevents runtime
  // crashes during static analysis, local development without secrets,
  // or tests that don't rely on a real Supabase instance.
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use the client.'
  );

  supabase = {
    auth: {
      // Mirrors the return shape of supabase.auth.getSession()
      getSession: async () => ({ data: { session: null }, error: null }),

      // Mirrors the return shape of onAuthStateChange in v2: returns { data: { subscription } }
      onAuthStateChange: (_callback: (event: string, session: any) => void) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),

      signInWithPassword: async (_creds: any) => ({ data: { user: null }, error: null }),
      signUp: async (_creds: any) => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async (_email: string) => ({ error: null }),
    },
  } as any;
}

export { supabase };
export default supabase;
