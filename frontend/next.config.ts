import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
    if (process.env.NODE_ENV !== "development" || !backend) return [];
    return [
      { source: "/api/auth/login", destination: `${backend}/auth/login` },
      ...["members", "favorites", "ratings"].map((path) => ({
        source: `/api/${path}/:rest*`,
        destination: `${backend}/${path}/:rest*`,
      })),
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
