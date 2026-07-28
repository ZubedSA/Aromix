/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compress: true,
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
        serverComponentsExternalPackages: ['@neondatabase/serverless', 'ws', '@prisma/adapter-neon'],
    },
};

module.exports = nextConfig;
