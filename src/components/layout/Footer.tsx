'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faXTwitter, faZhihu } from '@fortawesome/free-brands-svg-icons';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const currentLocale = pathname?.startsWith('/zh') ? 'zh' : 'en';

  // Get localized href based on current language
  const getLocalizedHref = (path: string) => {
    return currentLocale === 'zh' ? `/zh${path}` : path;
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left section - Logo, description and QR code (1/5 width) */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Image
                src="/creators-of-hami.svg"
                alt="Dynamia Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {t('footer.companyIntro')}
            </p>
            {currentLocale === 'zh' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{t('footer.followWechat')}</p>
                <Image
                  src="/images/qrcode.jpg"
                  alt="微信公众号二维码"
                  width={100}
                  height={100}
                  className="rounded"
                />
              </div>
            )}
          </div>

          {/* Right section - 4 columns of links (4/5 width) */}
          <div className="md:col-span-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* About */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">{t('footer.about')}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href={getLocalizedHref('/company')} className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.aboutCompany')}
                    </Link>
                  </li>
                  <li>
                    <Link href={getLocalizedHref('/case-studies')} className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.caseStudies')}
                    </Link>
                  </li>
                  <li>
                    <Link href={getLocalizedHref('/privacy-policy')} className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.privacyPolicy')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">{t('footer.resources')}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href={getLocalizedHref('/what-is-hami')} className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.documentation')}
                    </Link>
                  </li>
                  <li>
                    <Link href={getLocalizedHref('/pricing')} className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.pricing')}
                    </Link>
                  </li>
                  <li>
                    <Link href={currentLocale === 'zh' ? "https://www.bilibili.com/video/BV1A7dNYAED5" : "https://youtu.be/gxUobykvNH4"} className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.getDemo')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Community */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">{t('footer.community')}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="https://github.com/Project-HAMi/HAMi" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.github')}
                    </Link>
                  </li>
                  <li>
                    <Link href="https://cloud-native.slack.com/archives/C04NHKBFAVC" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.slack')}
                    </Link>
                  </li>
                  <li>
                    <Link href="https://discord.gg/Amhy7XmbNq" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.discord')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">{t('footer.contactSection')}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{t('footer.emailUs')}</p>
                    <a href="mailto:info@dynamia.ai" className="text-sm text-gray-500 hover:text-gray-900">
                      {t('footer.email')}
                    </a>
                  </div>

                  {/* Social Media Icons */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">{t('footer.socialMedia')}</p>
                    <div className="flex space-x-3">
                      {/* LinkedIn */}
                      <a
                        href="https://www.linkedin.com/company/dynamia-ai/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="LinkedIn"
                      >
                        <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
                      </a>

                      {/* X (Twitter) */}
                      <a
                        href="https://x.com/dynamia_ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="X (Twitter)"
                      >
                        <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
                      </a>

                      {/* Zhihu - Only show on Chinese pages */}
                      {currentLocale === 'zh' && (
                        <a
                          href="https://www.zhihu.com/org/shang-hai-mi-gua-zhi-neng-ke-ji-you-xian-gong-si"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="知乎"
                        >
                          <FontAwesomeIcon icon={faZhihu} className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CNCF logos */}
            <div className="mt-12 flex items-center space-x-6">
              <Image
                src="/images/cncfsandbox.png"
                alt="CNCF Sandbox"
                width={120}
                height={48}
                className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
              />
              <Image
                src="/images/cnailandscape.png"
                alt="CN AI Landscape"
                width={120}
                height={48}
                className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-400">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 