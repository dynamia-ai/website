export const POSTS_PER_PAGE = 9;

export function resolveBlogPage(value: string | string[] | undefined, totalPosts: number): number {
  const lastPage = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? Math.min(page, lastPage) : 1;
}

export function blogListingPath(page = 1, category = ""): string {
  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  if (category) query.set("category", category);
  return `/blog${query.size ? `?${query}` : ""}`;
}
