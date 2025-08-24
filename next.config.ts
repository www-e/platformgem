import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  eslint: {
    // Allow production builds to successfully complete even if project has ESLint errors
    ignoreDuringBuilds: true,
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "example.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "via.placeholder.com", port: "", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", port: "", pathname: "/**" },
      { protocol: "https", hostname: "your-cdn-domain.com", port: "", pathname: "/**" }
    ]
  }
};

export default nextConfig;
