// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this to expose environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;