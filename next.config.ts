import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    qualities: [75, 85, 90, 100],
  },
  async redirects() {
    return [
      { source: '/blog/case-prep-edu-hami', destination: '/case-studies/prep-edu', permanent: true },
      { source: '/blog/case-sf-technology-effective-gpu', destination: '/case-studies/sf-technology', permanent: true },
      { source: '/blog/case-telecom-gpu', destination: '/case-studies/telecom', permanent: true },
      { source: '/case-studies/case-prep-edu-hami', destination: '/case-studies/prep-edu', permanent: true },
      { source: '/case-studies/prep-edu-hami', destination: '/case-studies/prep-edu', permanent: true },
      { source: '/case-studies/case-sf-technology-effective-gpu', destination: '/case-studies/sf-technology', permanent: true },
      { source: '/case-studies/sf-technology-effective-gpu', destination: '/case-studies/sf-technology', permanent: true },
      { source: '/case-studies/case-telecom-gpu', destination: '/case-studies/telecom', permanent: true },
      { source: '/case-studies/telecom-gpu', destination: '/case-studies/telecom', permanent: true },
      { source: '/zh/blog/case-prep-edu-hami', destination: '/zh/case-studies/prep-edu', permanent: true },
      { source: '/zh/blog/case-sf-technology-effective-gpu', destination: '/zh/case-studies/sf-technology', permanent: true },
      { source: '/zh/blog/case-telecom-gpu', destination: '/zh/case-studies/telecom', permanent: true },
      { source: '/zh/case-studies/case-prep-edu-hami', destination: '/zh/case-studies/prep-edu', permanent: true },
      { source: '/zh/case-studies/prep-edu-hami', destination: '/zh/case-studies/prep-edu', permanent: true },
      { source: '/zh/case-studies/case-sf-technology-effective-gpu', destination: '/zh/case-studies/sf-technology', permanent: true },
      { source: '/zh/case-studies/sf-technology-effective-gpu', destination: '/zh/case-studies/sf-technology', permanent: true },
      { source: '/zh/case-studies/case-telecom-gpu', destination: '/zh/case-studies/telecom', permanent: true },
      { source: '/zh/case-studies/telecom-gpu', destination: '/zh/case-studies/telecom', permanent: true },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
