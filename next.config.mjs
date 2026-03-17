/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Vercel 部署配置
  output: 'standalone',
}

export default nextConfig;
