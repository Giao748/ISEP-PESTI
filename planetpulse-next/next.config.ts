import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://172.16.50.171:3000',
    'http://172.16.50.171:3001'
  ],
  /* config options here */
};

export default nextConfig;

