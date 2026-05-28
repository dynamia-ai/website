/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://dynamia.ai',
  generateRobotsTxt: true,
  // Optional: 更改 sitemap 的默认输出目录
  outDir: 'public',
  // Exclude admin, private routes, API routes, and attachment routes
  exclude: ['/admin/*', '/private/*', '/api/*', '/server-sitemap.xml', '/attachments/*', '/zh/attachments/*'],
  // Configure change frequency and priority for different route patterns
  transform: async (config, path) => {
    // Default settings
    let changefreq = 'weekly';
    let priority = 0.7;

    // Homepage gets highest priority
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Main pages get high priority
    else if (['/products', '/pricing', '/company'].includes(path)) {
      priority = 0.9;
      changefreq = 'weekly';
    }
    // Blog, case studies, and resources get medium-high priority
    else if (
      path.startsWith('/blog/') ||
      path.startsWith('/resources/') ||
      path.startsWith('/case-studies')
    ) {
      priority = 0.8;
      changefreq = 'monthly';
    }
    // Chinese pages get same priority as English
    else if (path.startsWith('/zh/')) {
      const englishPath = path.replace('/zh', '');
      if (englishPath === '/') {
        priority = 1.0;
        changefreq = 'daily';
      } else if (['/products', '/pricing', '/company'].includes(englishPath)) {
        priority = 0.9;
        changefreq = 'weekly';
      } else if (
        englishPath.startsWith('/blog/') ||
        englishPath.startsWith('/resources/') ||
        englishPath.startsWith('/case-studies')
      ) {
        priority = 0.8;
        changefreq = 'monthly';
      } else {
        priority = 0.7;
        changefreq = 'weekly';
      }
    }
    // Other pages get default priority
    else {
      priority = 0.6;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  // Add additional sitemaps if needed
  additionalPaths: async () => [
    // Add any dynamic paths that might not be automatically discovered
  ],
  // Optional: 配置 robots.txt
  robotsTxtOptions: {
    transformRobotsTxt: async (config, robotsTxt) => robotsTxt
      .replace(
        'Disallow: /api\n\n# GPTBot',
        'Disallow: /api\nContent-Signal: ai-train=no, search=yes, ai-input=no\n\n# GPTBot'
      )
      .replace(
        'User-agent: GPTBot\nDisallow: /\n\n# Google-Extended',
        'User-agent: GPTBot\nDisallow: /\nContent-Signal: ai-train=no, search=yes, ai-input=no\n\n# Google-Extended'
      )
      .replace(
        'User-agent: Google-Extended\nDisallow: /\n\n# Host',
        'User-agent: Google-Extended\nDisallow: /\nContent-Signal: ai-train=no, search=yes, ai-input=no\n\n# Host'
      ),
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/private', '/api'],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
    ],
    additionalSitemaps: [
      // Add additional sitemaps here if needed
    ],
  },
  // Optional: 生成 sitemap 的配置
  generateIndexSitemap: true,
  autoLastmod: true,
}
