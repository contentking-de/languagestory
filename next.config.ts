import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    clientSegmentCache: true
  },
  serverExternalPackages: ['prettier']
};

export default nextConfig;
