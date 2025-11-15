/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // TODO MUST REMOVE BEFORE DEPLOYMENT
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
