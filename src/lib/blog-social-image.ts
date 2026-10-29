import path from 'node:path';
import type { BlogPost } from '@/types/blog';

export function selectPostSocialImage(
  post: Pick<BlogPost, 'coverImage' | 'content'>,
  publicAssets: ReadonlySet<string>
): string | undefined {
  const exists = (imagePath: string) =>
    imagePath.startsWith('/') && publicAssets.has(path.posix.normalize(imagePath));

  if (post.coverImage && exists(post.coverImage)) return post.coverImage;

  const firstImage = post.content.match(/!\[[^\]]*]\((\/[^)\s]+)(?:\s+"[^"]*")?\)/)?.[1];
  return firstImage && exists(firstImage) ? firstImage : undefined;
}
