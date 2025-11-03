import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/mwhha64ay/Brickchain/**",
      },
    ],
  },
};

export default nextConfig;
