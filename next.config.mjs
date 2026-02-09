/** @type {import('next').NextConfig} */
const nextConfig = {
  // 无需 experimental.appDir 配置，因为在 Next.js 15 中 App Router 已经是默认功能
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/blog/case-prep-edu-hami',
        destination: '/case-studies/case-prep-edu-hami',
        permanent: true,
      },
      {
        source: '/blog/case-sf-technology-effective-gpu',
        destination: '/case-studies/case-sf-technology-effective-gpu',
        permanent: true,
      },
      {
        source: '/blog/case-telecom-gpu',
        destination: '/case-studies/case-telecom-gpu',
        permanent: true,
      },
      {
        source: '/zh/blog/case-prep-edu-hami',
        destination: '/zh/case-studies/case-prep-edu-hami',
        permanent: true,
      },
      {
        source: '/zh/blog/case-sf-technology-effective-gpu',
        destination: '/zh/case-studies/case-sf-technology-effective-gpu',
        permanent: true,
      },
      {
        source: '/zh/blog/case-telecom-gpu',
        destination: '/zh/case-studies/case-telecom-gpu',
        permanent: true,
      },
    ];
  },
};

export default nextConfig; 
