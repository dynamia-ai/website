'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Disclosure } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import HamiIcon from '@/components/HamiIcon';
import ExternalLinkIcon from '@/components/ExternalLinkIcon';
import { ModeToggle } from '@/components/ModeToggle';
import { useTheme } from 'next-themes';
// 暂时注释 Search 组件导入
// import Search from '@/components/Search';

// 定义子菜单项类型
type SubmenuItem = {
  name: string;
  description: string;
  href: string;
  external: boolean;
  iconName: 'infoCircle' | 'globe' | 'code' | 'users' | 'document' | 'blog' | 'folder';
}

const Header: React.FC = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 确定当前语言
  const currentLocale = pathname?.startsWith('/zh') ? 'zh' : 'en';

  // 确保组件已挂载，避免水合错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 切换语言
  const changeLanguage = (newLocale: string) => {
    // 获取当前路径和语言
    const currentPath = pathname || '/';
    
    if (newLocale === currentLocale) return;
    
    // 设置 Cookie，持久化语言选择
    if (typeof document !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 一年有效期
    }
    
    let newPath;
    if (newLocale === 'en') {
      // 从 /zh/... 切换到 /...（英文为默认语言，使用根路径而不是/en）
      if (currentPath === '/zh') {
        newPath = '/';
      } else if (currentPath.startsWith('/zh/')) {
        newPath = currentPath.replace(/^\/zh\//, '/');
      } else {
        newPath = currentPath.replace(/^\/zh/, '');
      }
    } else {
      // 从 /... 切换到 /zh/...
      if (currentPath === '/') {
        newPath = '/zh';
      } else if (currentPath.startsWith('/')) {
        newPath = `/zh${currentPath}`;
      } else {
        newPath = `/zh/${currentPath}`;
      }
    }
    
    // 使用 window.location 直接跳转，绕过 Next.js 的客户端路由
    if (newPath !== currentPath && typeof window !== 'undefined') {
      // 构建完整的 URL
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${newPath}`;
      
      // 直接修改地址
      window.location.href = fullUrl;
    }
  };

  const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';
  const isCurrentPath = (href: string) => normalizePath(pathname || '/') === normalizePath(href);

  // 导航链接
  const navigation = [
    { name: t('navigation.products'), href: '#', hasSubmenu: true, submenuType: 'products' },
    { name: t('navigation.caseStudies'), href: currentLocale === 'zh' ? '/zh/case-studies' : '/case-studies' },
    { name: t('navigation.resources'), href: '#', hasSubmenu: true, submenuType: 'resources' },
    { name: t('navigation.community'), href: '#', hasSubmenu: true, submenuType: 'hami' },
    { name: t('navigation.pricing'), href: currentLocale === 'zh' ? '/zh/pricing' : '/pricing' },
    { name: t('navigation.company'), href: currentLocale === 'zh' ? '/zh/company' : '/company' },
  ];

  // Products 子菜单
  const productsSubmenu: SubmenuItem[] = [
    {
      name: t('navigation.productsOverview'),
      description: t('navigation.productsOverviewDesc'),
      href: currentLocale === 'zh' ? '/zh/products' : '/products',
      external: false,
      iconName: 'infoCircle',
    },
    {
      name: t('navigation.hamiEnterprise'),
      description: t('navigation.hamiEnterpriseDesc'),
      href: currentLocale === 'zh' ? '/zh/products/hami-enterprise' : '/products/hami-enterprise',
      external: false,
      iconName: 'folder',
    },
    {
      name: t('navigation.hamiAiPlatform'),
      description: t('navigation.hamiAiPlatformDesc'),
      href: currentLocale === 'zh' ? '/zh/products/hami-ai-platform' : '/products/hami-ai-platform',
      external: false,
      iconName: 'globe',
    },
  ];

  // HAMi 子菜单
  const hamiSubmenu: SubmenuItem[] = [
    { 
      name: t('navigation.whatIsHami'), 
      description: t('navigation.whatIsHamiDesc'),
      href: currentLocale === 'zh' ? '/zh/what-is-hami' : '/what-is-hami', 
      external: false,
      iconName: 'infoCircle'
    },
    { 
      name: t('navigation.hamiWebsite'), 
      description: t('navigation.hamiWebsiteDesc'),
      href: 'https://project-hami.io/', 
      external: true,
      iconName: 'globe'
    },
    { 
      name: t('navigation.hamiGithub'), 
      description: t('navigation.hamiGithubDesc'),
      href: 'https://github.com/Project-HAMi/HAMi', 
      external: true,
      iconName: 'code'
    },
    {
      name: t('navigation.joinCommunity'),
      description: t('navigation.joinCommunityDesc'),
      href: 'https://project-hami.io/community/',
      external: true,
      iconName: 'users'
    },
  ];

  // 资源子菜单
  const resourcesSubmenu: SubmenuItem[] = [
    { 
      name: t('navigation.resourcesDoc'), 
      description: t('navigation.resourcesDocDesc'),
      href: 'https://project-hami.io/docs/', 
      external: true,
      iconName: 'document'
    },
    { 
      name: t('navigation.resourcesBlog'), 
      description: t('navigation.resourcesBlogDesc'),
      href: currentLocale === 'zh' ? '/zh/blog' : '/blog', 
      external: false,
      iconName: 'blog'
    },
    {
      name: t('navigation.resourcesTools'),
      description: t('navigation.resourcesToolsDesc'),
      href: currentLocale === 'zh' ? '/zh/tools' : '/tools',
      external: false,
      iconName: 'folder'
    },
    {
      name: t('navigation.resourcesVideos'),
      description: t('navigation.resourcesVideosDesc'),
      href: currentLocale === 'zh' ? '/zh/videos' : '/videos',
      external: false,
      iconName: 'document'
    },
    {
      name: t('navigation.adopters'),
      description: t('navigation.adoptersDesc'),
      href: 'https://github.com/Project-HAMi/HAMi/issues/4', 
      external: true,
      iconName: 'users'
    }
  ];

  // 解决方案子菜单
  const solutionsSubmenu: SubmenuItem[] = [
    {
      name: t('navigation.caseSfTechnology'),
      description: t('navigation.caseSfTechnologyDesc'),
      href: currentLocale === 'zh' ? '/zh/case-studies/sf-technology' : '/case-studies/sf-technology',
      external: false,
      iconName: 'document'
    },
    {
      name: t('navigation.casePrepEdu'),
      description: t('navigation.casePrepEduDesc'),
      href: currentLocale === 'zh' ? '/zh/case-studies/prep-edu' : '/case-studies/prep-edu',
      external: false,
      iconName: 'document'
    },
    // Temporarily hidden - Telecom Provider Case
    // { 
    //   name: t('navigation.caseTelecom'), 
    //   description: t('navigation.caseTelecomDesc'),
    //   href: currentLocale === 'zh' ? '/zh/case-studies/telecom' : '/case-studies/telecom', 
    //   external: false,
    //   iconName: 'document'
    // },
  ];

  // 控制下拉菜单的状态
  const [isHamiMenuOpen, setIsHamiMenuOpen] = useState(false);
  const [isResourcesMenuOpen, setIsResourcesMenuOpen] = useState(false);
  const [isSolutionsMenuOpen, setIsSolutionsMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const hamiMenuRef = useRef<HTMLDivElement>(null);
  const resourcesMenuRef = useRef<HTMLDivElement>(null);
  const solutionsMenuRef = useRef<HTMLDivElement>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);
  const hamiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const solutionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const productsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearHamiCloseTimeout = () => {
    if (hamiTimeoutRef.current) {
      clearTimeout(hamiTimeoutRef.current);
      hamiTimeoutRef.current = null;
    }
  };
  
  const clearResourcesCloseTimeout = () => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
      resourcesTimeoutRef.current = null;
    }
  };
  
  const clearSolutionsCloseTimeout = () => {
    if (solutionsTimeoutRef.current) {
      clearTimeout(solutionsTimeoutRef.current);
      solutionsTimeoutRef.current = null;
    }
  };

  const clearProductsCloseTimeout = () => {
    if (productsTimeoutRef.current) {
      clearTimeout(productsTimeoutRef.current);
      productsTimeoutRef.current = null;
    }
  };

  const handleProductsMouseEnter = () => {
    clearProductsCloseTimeout();
    setIsProductsMenuOpen(true);
  };

  const handleProductsMouseLeave = () => {
    clearProductsCloseTimeout();
    productsTimeoutRef.current = setTimeout(() => {
      setIsProductsMenuOpen(false);
    }, 300);
  };
  
  // 打开 HAMi 菜单；与资源菜单互斥，避免快速划过时两个全宽面板重叠
  const handleHamiMouseEnter = () => {
    clearHamiCloseTimeout();
    clearResourcesCloseTimeout();
    setIsResourcesMenuOpen(false);
    setIsHamiMenuOpen(true);
  };
  
  // 延迟关闭 HAMi 菜单
  const handleHamiMouseLeave = () => {
    clearHamiCloseTimeout();
    hamiTimeoutRef.current = setTimeout(() => {
      setIsHamiMenuOpen(false);
    }, 300); // 300ms 延迟，给用户足够时间移动到下拉菜单
  };

  // 打开资源菜单；与 HAMi 菜单互斥
  const handleResourcesMouseEnter = () => {
    clearResourcesCloseTimeout();
    clearHamiCloseTimeout();
    setIsHamiMenuOpen(false);
    setIsResourcesMenuOpen(true);
  };
  
  // 延迟关闭资源菜单
  const handleResourcesMouseLeave = () => {
    clearResourcesCloseTimeout();
    resourcesTimeoutRef.current = setTimeout(() => {
      setIsResourcesMenuOpen(false);
    }, 300); // 300ms 延迟，给用户足够时间移动到下拉菜单
  };

  // 打开解决方案菜单
  const handleSolutionsMouseEnter = () => {
    clearSolutionsCloseTimeout();
    setIsSolutionsMenuOpen(true);
  };
  
  // 延迟关闭解决方案菜单
  const handleSolutionsMouseLeave = () => {
    clearSolutionsCloseTimeout();
    solutionsTimeoutRef.current = setTimeout(() => {
      setIsSolutionsMenuOpen(false);
    }, 300);
  };
  
  // 清除超时器
  useEffect(() => {
    return () => {
      clearHamiCloseTimeout();
      clearResourcesCloseTimeout();
      clearSolutionsCloseTimeout();
      clearProductsCloseTimeout();
    };
  }, []);
  
  // 处理点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (hamiMenuRef.current && !hamiMenuRef.current.contains(event.target as Node)) {
        setIsHamiMenuOpen(false);
      }
      if (resourcesMenuRef.current && !resourcesMenuRef.current.contains(event.target as Node)) {
        setIsResourcesMenuOpen(false);
      }
      if (solutionsMenuRef.current && !solutionsMenuRef.current.contains(event.target as Node)) {
        setIsSolutionsMenuOpen(false);
      }
      if (productsMenuRef.current && !productsMenuRef.current.contains(event.target as Node)) {
        setIsProductsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hamiMenuRef, resourcesMenuRef, solutionsMenuRef, productsMenuRef]);

  // 如果组件未挂载，返回一个占位符避免水合错误
  if (!mounted) {
    return (
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-40 h-10 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const desktopMenuTopClass = 'top-16';
  const logoSrc = currentLocale === 'zh'
    ? resolvedTheme === 'dark'
      ? '/dynamia-logo-zh-white.svg'
      : '/dynamia-logo-zh.svg'
    : resolvedTheme === 'dark'
      ? '/dynamia-logo-white.svg'
      : '/dynamia-logo.svg';
  const logoClassName = currentLocale === 'zh'
    ? 'block w-32 h-8 -ml-3 lg:w-36 lg:h-9 lg:-ml-4 xl:w-40 xl:h-10 xl:-ml-5 shrink-0'
    : 'block w-32 h-8 lg:w-36 lg:h-9 xl:w-40 xl:h-10 shrink-0';

  return (
    <Disclosure as="nav" className="bg-white dark:bg-gray-950 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href={currentLocale === 'zh' ? '/zh' : '/'} className="flex items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoSrc}
                      alt="Dynamia AI Logo"
                      width={160}
                      height={40}
                      className={logoClassName}
                    />
                  </Link>
                </div>
                <div className="hidden lg:ml-4 lg:flex lg:h-16 lg:space-x-2 xl:ml-8 xl:space-x-5">
                  {navigation.map((item) => (
                    item.hasSubmenu ? (
                      <div
                        key={item.name}
                        ref={
                          item.submenuType === 'hami'
                            ? hamiMenuRef
                            : item.submenuType === 'resources'
                              ? resourcesMenuRef
                              : item.submenuType === 'products'
                                ? productsMenuRef
                                : solutionsMenuRef
                        }
                        className="relative flex items-center h-full"
                      >
                        <div
                          className={`inline-flex items-center whitespace-nowrap px-1 pt-1 h-full border-b-2 text-sm xl:text-base font-medium ${
                            (item.submenuType === 'hami' && isHamiMenuOpen) ||
                            (item.submenuType === 'resources' && isResourcesMenuOpen) ||
                            (item.submenuType === 'products' && isProductsMenuOpen) ||
                            (item.submenuType === 'solutions' && isSolutionsMenuOpen)
                              ? 'border-primary text-gray-900 dark:text-gray-100'
                              : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-primary/60 hover:text-gray-700 dark:hover:text-gray-100'
                          }`}
                          onMouseEnter={
                            item.submenuType === 'hami'
                              ? handleHamiMouseEnter
                              : item.submenuType === 'resources'
                                ? handleResourcesMouseEnter
                                : item.submenuType === 'products'
                                  ? handleProductsMouseEnter
                                  : handleSolutionsMouseEnter
                          }
                          onMouseLeave={
                            item.submenuType === 'hami'
                              ? handleHamiMouseLeave
                              : item.submenuType === 'resources'
                                ? handleResourcesMouseLeave
                                : item.submenuType === 'products'
                                  ? handleProductsMouseLeave
                                  : handleSolutionsMouseLeave
                          }
                        >
                          {item.name}
                          <ChevronDownIcon
                            className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                              (item.submenuType === 'hami' && isHamiMenuOpen) ||
                              (item.submenuType === 'resources' && isResourcesMenuOpen) ||
                              (item.submenuType === 'products' && isProductsMenuOpen) ||
                              (item.submenuType === 'solutions' && isSolutionsMenuOpen)
                                ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>

                        {((item.submenuType === 'hami' && isHamiMenuOpen) ||
                          (item.submenuType === 'resources' && isResourcesMenuOpen) ||
                          (item.submenuType === 'products' && isProductsMenuOpen) ||
                          (item.submenuType === 'solutions' && isSolutionsMenuOpen)) && (
                          <div
                            className={`fixed left-0 right-0 ${desktopMenuTopClass} bg-white dark:bg-gray-950 shadow-lg z-50 fadeIn transition-colors duration-300`}
                            onMouseEnter={
                              item.submenuType === 'hami'
                                ? handleHamiMouseEnter
                                : item.submenuType === 'resources'
                                  ? handleResourcesMouseEnter
                                  : item.submenuType === 'products'
                                    ? handleProductsMouseEnter
                                    : handleSolutionsMouseEnter
                            }
                            onMouseLeave={
                              item.submenuType === 'hami'
                                ? handleHamiMouseLeave
                                : item.submenuType === 'resources'
                                  ? handleResourcesMouseLeave
                                  : item.submenuType === 'products'
                                    ? handleProductsMouseLeave
                                    : handleSolutionsMouseLeave
                            }
                          >
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                              <div className="flex">
                                {/* Left side - Large title */}
                                <div className="w-1/3 pr-10 pl-2 xl:pl-4">
                                  <div className="dropdown-description">
                                    <div className="dropdown-title text-gray-900 dark:text-gray-100">
                                      {item.name}
                                    </div>
                                    {(item.submenuType === 'products' || item.submenuType === 'resources' || item.submenuType === 'hami') && (
                                      <div className="mt-auto pb-1">
                                        <HamiIcon
                                          iconName={
                                            item.submenuType === 'products'
                                              ? 'folder'
                                              : item.submenuType === 'resources'
                                                ? 'document'
                                                : 'users'
                                          }
                                          className="h-24 w-24"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right side - Menu items with dividers */}
                                <div className="w-2/3 border-l border-gray-200 dark:border-gray-700 pl-10">
                                  <ul className="grid grid-cols-2 gap-4">
                                    {(
                                      item.submenuType === 'hami'
                                        ? hamiSubmenu
                                        : item.submenuType === 'resources'
                                          ? resourcesSubmenu
                                          : item.submenuType === 'products'
                                            ? productsSubmenu
                                            : solutionsSubmenu
                                    ).map((subItem) => (
                                      <li
                                        key={subItem.name}
                                        className="menu-item"
                                      >
                                        {subItem.external ? (
                                          <a
                                            href={subItem.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block p-4 rounded-md transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800/90"
                                          >
                                            <div className="menu-item__title font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-100 mb-1">
                                              {subItem.name}
                                            </div>
                                            <span className="d-flex justify-content-between">
                                              <div className="menu-item__text text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 text-sm">
                                                <p>{subItem.description}</p>
                                              </div>
                                            </span>
                                          </a>
                                        ) : (
                                          <Link
                                            href={subItem.href}
                                            className={`group block p-4 rounded-md transition-colors duration-150 ${
                                              isCurrentPath(subItem.href)
                                                ? 'bg-primary-lighter dark:bg-gray-800/90 ring-1 ring-primary/30'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/90'
                                            }`}
                                          >
                                            <div className="menu-item__title font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-100 mb-1">
                                              {subItem.name}
                                            </div>
                                            <span className="d-flex justify-content-between">
                                              <div className="menu-item__text text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 text-sm">
                                                <p>{subItem.description}</p>
                                              </div>
                                            </span>
                                          </Link>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex items-center whitespace-nowrap h-full px-1 pt-1 border-b-2 text-sm xl:text-base font-medium ${
                          pathname === item.href || (pathname === '/' && item.href === '/')
                            ? 'border-primary text-gray-900 dark:text-gray-100'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-primary/60 hover:text-gray-700 dark:hover:text-gray-100'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )
                  ))}
                </div>
              </div>
              <div className="hidden lg:ml-3 lg:flex lg:items-center lg:space-x-2 xl:ml-6 xl:space-x-3">
                {/* 暂时隐藏搜索栏 */}
                {/* <Search /> */}

                {currentLocale === 'zh' && (
                  <a
                    href="tel:4000267800"
                    className="inline-flex items-center px-1.5 xl:px-2 py-2 text-xs xl:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white whitespace-nowrap"
                  >
                    <PhoneIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    400-026-7800
                  </a>
                )}

                <Link
                  href={currentLocale === 'zh' ? '/zh/apply-trial' : '/apply-trial'}
                  className="inline-flex items-center px-2 xl:px-3 py-1 xl:py-2 border border-transparent text-xs xl:text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark whitespace-nowrap"
                >
                  {t('navigation.freeTrial')}
                </Link>

                {/* Dark Mode Toggle */}
                <ModeToggle />

                <div className="relative group">
                  <button
                    className="inline-flex items-center px-1.5 xl:px-2 py-2 text-xs xl:text-sm font-medium cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap"
                  >
                    {currentLocale === 'zh' ? '简体中文' : 'English'}
                    <svg className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-white/10 py-1 min-w-[140px]">
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          currentLocale === 'en'
                            ? 'text-primary font-medium bg-primary/5'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => changeLanguage('zh')}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          currentLocale === 'zh'
                            ? 'text-primary font-medium bg-primary/5'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        简体中文
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-mr-2 flex items-center lg:hidden">
                <Disclosure.Button
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                >
                  <span className="sr-only">{t('navigation.openMenu')}</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="pt-2 pb-3 space-y-1 px-2 bg-white dark:bg-gray-950 transition-colors duration-300">
              {navigation.map((item) => (
                item.hasSubmenu ? (
                  <Disclosure as="div" key={item.name} className="rounded-lg">
                    {({ open }) => (
                      <>
                          <Disclosure.Button
                            className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{item.name}</span>
                              <ChevronDownIcon
                                className={`h-5 w-5 transition-transform duration-200 text-gray-400 ${
                                  open ? 'transform rotate-180' : ''
                                }`}
                              />
                            </div>
                          </Disclosure.Button>
                          <Disclosure.Panel className="pt-2 pb-3 px-2 space-y-1">
                            {(
                              item.submenuType === 'hami'
                                ? hamiSubmenu
                                : item.submenuType === 'resources'
                                  ? resourcesSubmenu
                                  : item.submenuType === 'products'
                                    ? productsSubmenu
                                    : solutionsSubmenu
                            ).map((subItem) => (
                              <div key={subItem.name} className="rounded-lg hover:bg-primary-lighter dark:hover:bg-primary/20 transition-colors duration-150">
                                {subItem.external ? (
                                  <a
                                    href={subItem.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-3"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start flex-1 min-w-0">
                                        <div className="mr-3 mt-0.5 flex-shrink-0">
                                          <HamiIcon iconName={subItem.iconName} className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                                            {subItem.name}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                                            {subItem.description}
                                          </div>
                                        </div>
                                      </div>
                                      <ExternalLinkIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2 mt-1" aria-hidden="true" />
                                    </div>
                                  </a>
                                ) : (
                                  <Link
                                    href={subItem.href}
                                    className={`block px-4 py-3 rounded-lg transition-colors ${
                                      isCurrentPath(subItem.href)
                                        ? 'bg-primary-lighter dark:bg-primary/20 ring-1 ring-primary/30'
                                        : ''
                                    }`}
                                  >
                                    <div className="flex items-start">
                                      <div className="mr-3 mt-0.5 flex-shrink-0">
                                        <HamiIcon iconName={subItem.iconName} className="h-5 w-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                                          {subItem.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                                          {subItem.description}
                                        </div>
                                      </div>
                                    </div>
                                  </Link>
                                )}
                              </div>
                            ))}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors touch-manipulation ${
                      pathname === item.href
                        ? 'text-primary-dark dark:text-primary bg-primary-lighter dark:bg-primary/20 font-semibold'
                        : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            {/* Language Switcher */}
            <div className="px-2 py-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              {/* Theme Toggle Mobile */}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center justify-between px-4 py-3 text-base font-medium cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
              >
                <div className="flex items-center">
                  <span className="mr-3">🌓</span>
                  <span className="flex-1 text-left">Theme / 主题</span>
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                  <span className="text-sm font-semibold text-primary">
                    {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </div>
              </button>

              <div className="px-2 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {currentLocale === 'zh' ? '语言' : 'Language'}
                </div>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full flex items-center px-4 py-2.5 text-base font-medium rounded-lg transition-colors touch-manipulation ${
                    currentLocale === 'en'
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('zh')}
                  className={`w-full flex items-center px-4 py-2.5 text-base font-medium rounded-lg transition-colors touch-manipulation ${
                    currentLocale === 'zh'
                      ? 'text-primary bg-primary/5'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  简体中文
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              {currentLocale === 'zh' && (
                <a
                  href="tel:4000267800"
                  className="flex items-center justify-center w-full px-6 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors touch-manipulation"
                >
                  <PhoneIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  400-026-7800
                </a>
              )}
              <Link
                href={currentLocale === 'zh' ? '/zh/apply-trial' : '/apply-trial'}
                className="flex items-center justify-center w-full px-6 py-3.5 text-base font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm touch-manipulation"
              >
                {t('navigation.freeTrial')}
              </Link>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header; 
