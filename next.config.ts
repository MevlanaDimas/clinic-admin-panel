import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: `/${process.env.GCS_BUCKET_NAME}/**`
      }
    ]
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/promo",
        permanent: true
      }
    ]
  }
};

export default nextConfig;
