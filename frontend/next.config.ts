import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "inizsoft-school-mnagement.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },

  turbopack: {
    root: path.resolve(__dirname),
  }
};

export default nextConfig;
