'use client';

interface DynamicBlogCoverProps {
  title: string;
  className?: string;
  variant?: 'list' | 'detail';
}

/**
 * 博客封面组件 - 使用 CSS 绘制科技感背景，避免依赖静态封面图。
 */
export default function DynamicBlogCover({
  title,
  className = '',
  variant = 'list',
}: DynamicBlogCoverProps) {

  const titleLines = title.includes('\n')
    ? title.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    : [title.trim()];

  return (
    <div className={`relative w-full h-full ${className} overflow-hidden bg-[#f5f8f2] dark:bg-[#060b10]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(118,185,0,0.32),transparent_26%),radial-gradient(circle_at_82%_22%,rgba(14,165,233,0.22),transparent_30%),linear-gradient(135deg,#f8fbf4_0%,#e9f7df_42%,#eef5ff_100%)] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(118,185,0,0.42),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(45,212,191,0.22),transparent_32%),linear-gradient(135deg,#061018_0%,#0b1721_48%,#101827_100%)]" />
      <div className="absolute inset-0 opacity-[0.34] dark:opacity-[0.28] [background-image:linear-gradient(rgba(22,55,78,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(22,55,78,0.16)_1px,transparent_1px)] dark:[background-image:linear-gradient(rgba(148,255,181,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,255,181,0.18)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-primary/70 via-transparent to-transparent" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-primary/30 dark:border-primary/40" />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border border-sky-500/25 dark:border-cyan-300/25" />
      <div className="absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-white/55 to-transparent dark:from-black/35" />

      <div className="absolute inset-0 flex items-center justify-center px-8">
        <h2 className={`max-w-[82%] text-balance font-semibold leading-tight text-[#17478b] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] dark:text-white dark:drop-shadow-[0_0_22px_rgba(118,185,0,0.28)] ${
          variant === 'detail'
            ? 'text-3xl md:text-4xl lg:text-5xl'
            : 'text-xl md:text-2xl'
        } ${
          titleLines.length === 1 ? 'text-center' : 'text-left'
        }`}>
          {titleLines.map((line: string, index: number) => (
            <span key={index} className="block">
              {line}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}
