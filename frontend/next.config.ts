import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://192.168.1.215:3000", "192.168.1.215"],
  async rewrites() {
    return [
      {
        source: '/marta/:path*',
        destination: 'http://localhost:8080/marta/:path*',
      },
    ];
  },
};

export default nextConfig;
