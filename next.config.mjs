/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: { formats: ['image/avif', 'image/webp'] },
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'framer-motion'],
  },
};

export default nextConfig;
