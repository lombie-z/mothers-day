import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/index.html#/~/work",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
