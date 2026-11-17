import Link from 'next/link';
import SiteArrow from '@/components/layout/SiteArrow';
import {formatBlogDate} from '@/lib/site/blogData';

interface BlogCardProps {
  href: string;
  title: string;
  desc: string;
  category: string;
  categoryId: string;
  date: string;
  coverTitle?: string;
  coverSubtitle?: string;
  coverBrand: string;
  coverMarkAlt: string;
  readMore: string;
  logoSrc: string;
}

export default function BlogCard({
  href,
  title,
  desc,
  category,
  categoryId,
  date,
  coverTitle,
  coverSubtitle,
  coverBrand,
  coverMarkAlt,
  readMore,
  logoSrc,
}: BlogCardProps) {
  return (
    <Link className="blog-card" href={href}>
      <div className="content-cover editorial-cover" data-category={categoryId}>
        <div className="text-cover">
          <div className="cover-topline">
            <img className="cover-mark" src={logoSrc} alt={coverMarkAlt} />
            <span className="cover-category">{category}</span>
          </div>
          <div className="cover-title-block">
            <strong>{coverTitle || title}</strong>
            {coverSubtitle ? <span className="cover-subtitle">{coverSubtitle}</span> : null}
          </div>
          <small>{coverBrand}</small>
        </div>
      </div>
      <div className="blog-card-body">
        <div className="article-meta">
          <span>{category}</span>
          <time dateTime={date}>{formatBlogDate(date)}</time>
        </div>
        <h2>{title}</h2>
        <p>{desc}</p>
        <span className="read-more">
          {readMore}
          <SiteArrow variant="text" />
        </span>
      </div>
    </Link>
  );
}
