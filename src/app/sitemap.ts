import { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllBlogPosts } from "@/lib/blog-server";
import { getProductIds } from "@/lib/enterprise";
import { getInstallDocLocales, getInstallDocSlugs } from "@/lib/enterprise-docs";
import {
  BLOG_LOCALES,
  CASE_STUDY_LOCALES,
  CASE_STUDY_SLUGS,
  STATIC_INDEXABLE_PATHS,
} from "@/lib/seo-routes";
import { localizedAlternates, localizedUrl } from "@/utils/i18n";

type SitemapEntry = MetadataRoute.Sitemap[number];

function entriesForPath(
  path: string,
  locales: readonly string[],
  options: Pick<SitemapEntry, "changeFrequency" | "priority" | "lastModified">
): MetadataRoute.Sitemap {
  const languages = localizedAlternates(path, locales);

  return locales.map((locale) => ({
    url: localizedUrl(path, locale),
    alternates: { languages },
    ...options,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const generatedAt = new Date();
  const staticEntries = STATIC_INDEXABLE_PATHS.flatMap((path) =>
    entriesForPath(path, routing.locales, {
      lastModified: generatedAt,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.7,
    })
  );

  const blogIndexEntries = entriesForPath("/blog", BLOG_LOCALES, {
    lastModified: generatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  });

  const caseStudyIndexEntries = entriesForPath("/case-studies", CASE_STUDY_LOCALES, {
    lastModified: generatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  });

  const productEntries = getProductIds().flatMap((productId) =>
    entriesForPath(`/products/${productId}`, routing.locales, {
      lastModified: generatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  const installEntries = getInstallDocSlugs().flatMap((productId) => {
    const locales = getInstallDocLocales(productId);
    return entriesForPath(`/products/${productId}/install`, locales, {
      lastModified: generatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  });

  const caseStudyEntries = CASE_STUDY_SLUGS.flatMap((slug) =>
    entriesForPath(`/case-studies/${slug}`, CASE_STUDY_LOCALES, {
      lastModified: generatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const blogPostEntries = BLOG_LOCALES.flatMap((locale) =>
    getAllBlogPosts(locale).posts.map((post) => {
      const path = `/blog/${post.slug}`;
      const availableLocales = BLOG_LOCALES.filter((candidate) =>
        getAllBlogPosts(candidate).posts.some((candidatePost) => candidatePost.slug === post.slug)
      );

      return {
        url: localizedUrl(path, locale),
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: { languages: localizedAlternates(path, availableLocales) },
      };
    })
  );

  return [
    ...staticEntries,
    ...blogIndexEntries,
    ...caseStudyIndexEntries,
    ...productEntries,
    ...installEntries,
    ...caseStudyEntries,
    ...blogPostEntries,
  ];
}
