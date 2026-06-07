"use client";

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { BlogPostMeta } from '@/types/blog';
import DynamicBlogCover from '@/components/DynamicBlogCover';
import { formatDate } from '@/lib/blog-client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const POSTS_PER_PAGE = 9;

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Blog card component
const BlogCard = ({ post, currentLocale }: { post: BlogPostMeta; currentLocale: 'en' | 'zh' }) => {
  const bt = useTranslations();
  const blogPath = currentLocale === 'en' ? `/blog/${post.slug}` : `/${currentLocale}/blog/${post.slug}`;
  const displayCategory = bt(`blogUI.categories.${post.category}`) || post.category;

  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      variants={fadeIn}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-md transition-shadow duration-300"
    >
      <Link href={blogPath}>
        <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* 悬停时封面图放大 */}
          <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-105">
            <DynamicBlogCover
              title={post.linktitle || post.coverTitle || post.title}
              className="w-full h-full"
            />
          </div>
          {/* 分类标签 */}
          <div className="absolute top-3 right-3">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-white dark:bg-gray-900/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-full">
              {displayCategory}
            </span>
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
            <time dateTime={post.date}>
              {formatDate(post.date, currentLocale)}
            </time>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

interface BlogListClientProps {
  enPosts: BlogPostMeta[];
  zhPosts: BlogPostMeta[];
  enTags?: string[];
  zhTags?: string[];
  categories?: string[]; // 分类列表
  selectedTag?: string;
}

export default function BlogListClient(
  { enPosts, zhPosts, categories = [], ..._unusedProps }: BlogListClientProps
) {
  void _unusedProps;
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const currentLocale = locale as 'en' | 'zh';

  // Get posts for current language
  const allPosts = currentLocale === 'zh' ? zhPosts : enPosts;

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter posts by category
  const posts = selectedCategory === 'All' 
    ? allPosts 
    : allPosts.filter(post => post.category === selectedCategory);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Sync page with URL query param
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const validPage = Math.max(1, Math.min(pageFromUrl, totalPages || 1));
    setCurrentPage(validPage);
  }, [searchParams, posts.length]);

  // Calculate pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl mb-4">
              {t('resources.blog.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('resources.blog.description')}
            </p>
          </motion.div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === 'All'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {t('blogUI.all')} ({allPosts.length})
                </button>
                {categories.map((category) => {
                  const count = allPosts.filter(post => post.category === category).length;
                  const displayName = t(`blogUI.categories.${category}`) || category;
                  
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {displayName} ({count})
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Blog posts grid */}
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentPosts.map((post) => (
                <BlogCard
                  currentLocale={currentLocale}
                  key={post.slug}
                  post={post}
                />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <Link
                    href={currentPage > 1 ? `?page=${currentPage - 1}` : '#'}
                    onClick={(e) => {
                      if (currentPage <= 1) e.preventDefault();
                      else handlePageChange(currentPage - 1);
                    }}
                    className={`px-4 py-2 rounded-md border ${
                      currentPage > 1
                        ? 'border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {t('blogUI.previous')}
                  </Link>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, and pages around current page
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!showPage) {
                        // Show ellipsis for hidden pages
                        if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span
                              key={page}
                              className="px-3 py-2 text-gray-400 dark:text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Link
                          key={page}
                          href={`?page=${page}`}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-md border ${
                            page === currentPage
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900'
                          }`}
                        >
                          {page}
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
                    onClick={(e) => {
                      if (currentPage >= totalPages) e.preventDefault();
                      else handlePageChange(currentPage + 1);
                    }}
                    className={`px-4 py-2 rounded-md border ${
                      currentPage < totalPages
                        ? 'border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {t('blogUI.next')}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('blogUI.noPosts')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  {t('blogUI.noPostsDesc')}
                </p>
              </div>
            </div>
          )}

          {/* Newsletter CTA */}
          {currentPosts.length > 0 && (
            <div className="mt-16 bg-gradient-to-r from-primary-light to-primary-lighter rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t('blogUI.subscribe')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                {t('blogUI.subscribeDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={t('blogUI.emailPlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
                <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                  {t('blogUI.subscribeButton')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
