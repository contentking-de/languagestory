import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    clientSegmentCache: true
  },
  serverExternalPackages: ['prettier'],
  async rewrites() {
    return [{ source: '/resources', destination: '/dashboard/resources' }];
  }
};

export default nextConfig;
