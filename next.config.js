/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compress: true,
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
};

module.exports = nextConfig;
