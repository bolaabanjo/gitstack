// Build an env object only from variables that are actually set. This avoids
// shipping empty or undefined values into the Next.js config which triggers
// the "invalid next.config.js options" warning in dev.
const env = {};
if (process.env.SUPABASE_URL) env.SUPABASE_URL = process.env.SUPABASE_URL;
if (process.env.SUPABASE_ANON_KEY) env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
if (process.env.AI_ENDPOINT) env.AI_ENDPOINT = process.env.AI_ENDPOINT;
if (process.env.GITHUB_CLIENT_ID) env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
if (process.env.GITHUB_CLIENT_SECRET) env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Prefer client-safe NEXT_PUBLIC_* variables for front-end usage; include them
// if present as well so a developer can set only NEXT_PUBLIC_* vars locally.
if (process.env.NEXT_PUBLIC_SUPABASE_URL) env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) env.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (process.env.NEXT_PUBLIC_AI_ENDPOINT) env.AI_ENDPOINT = process.env.NEXT_PUBLIC_AI_ENDPOINT;
if (process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID) env.GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

module.exports = {
  reactStrictMode: true,
  // Only include env in the exported config when we actually have values.
  ...(Object.keys(env).length ? { env } : {}),
  images: {
    domains: ['your-image-domain.com'], // Add your image domains here
  },
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
};