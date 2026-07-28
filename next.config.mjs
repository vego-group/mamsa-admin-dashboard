/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'staging.mamsaa.com' },
      { protocol: 'https', hostname: 'api.mamsaa.com' },
    ],
  },
};

export default nextConfig;
