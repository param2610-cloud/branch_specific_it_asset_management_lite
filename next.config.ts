import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gravatar.com',
        port: '',
        pathname: '/avatar/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.205',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
