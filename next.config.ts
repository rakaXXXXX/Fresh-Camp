/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix untuk API routes dynamic
  output: 'standalone',
  
  // Skip static rendering untuk pages bermasalah
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    skipTrailingSlashRedirect: true,
  },
  
  // Force API routes jadi dynamic
  generateStaticParams: async () => {
    return [];
  }
};

module.exports = nextConfig;