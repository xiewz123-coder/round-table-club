/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 部署配置
  images: {
    unoptimized: true,
  },
  // 禁用 ESLint 在构建时
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 禁用 TypeScript 类型检查（如有需要）
  typescript: {
    ignoreBuildErrors: true,
  },
  // 允许从外部访问
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
