import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isProd ? "/Portfolio-Website" : "",
  allowedDevOrigins: ["192.168.0.120", "localhost"],
};

export default nextConfig;
