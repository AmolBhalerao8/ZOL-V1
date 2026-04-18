import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@google-cloud/tasks',
    'googleapis',
    'google-auth-library',
  ],
};

export default nextConfig;
