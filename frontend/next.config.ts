import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://192.168.1.215:3000", "192.168.1.215"],
  async rewrites() {
    return [
      {
        source: '/marta/:path*',
        destination: `${backendUrl}/marta/:path*`,
      },
    ];
  },
};

export default nextConfig;
