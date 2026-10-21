import type { NextConfig } from "next";
import { sanity } from "next-sanity/live/cache-life";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Sanity Live revalidates tagged cache entries on publish, so cached content can live long
  cacheLife: {
    default: sanity,
  },
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/6d0ozc5q/**" }],
  },
  async redirects() {
    return [{ source: "/admin", destination: "https://desart-solis.sanity.studio", permanent: false }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
