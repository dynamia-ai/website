// Only aliases with an existing equivalent article are redirected.
// Keep case-only redirects in middleware: next.config redirects match case-insensitively.
const canonicalSlugs = new Set([
  "faq",
  "hami-metax",
  "open-source-vgpu-hami-k8s-vdcu",
  "hami-koordinator-v1.6",
  "hami-v.2.5.0-released",
  "open-source-vgpu-spread-binpack",
  "demystifying-the-reservation-pod",
  "run-ai-kai-scheduler-vs-hami",
  "prep-edu-hami",
  "open-source-vgpu-hami-webhook",
]);

const renamedSlugs: Record<string, string> = {
  "open-source-vgpu-hami-core(libvgpu.so)vcuda": "open-source-vgpu-hami-core-libvgpu-so-vcuda",
  "open-source-vgpu-hami-device-plugin-nvidia-analysis": "open-source-vgpu-hami-device-plugin-nvidia",
};

export function legacyBlogDestination(pathname: string): string | null {
  const match = pathname.match(/^(\/(?:en\/|zh\/|de\/)?blog\/)([^/]+)\/?$/);
  if (!match) return null;
  const [, prefix, encodedSlug] = match;
  let slug: string;
  try { slug = decodeURIComponent(encodedSlug); } catch { return null; }
  const lowerSlug = slug.toLowerCase();
  const renamed = Object.hasOwn(renamedSlugs, lowerSlug) ? renamedSlugs[lowerSlug] : undefined;
  const destination = renamed ??
    (canonicalSlugs.has(lowerSlug) && slug !== lowerSlug ? lowerSlug : null);
  if (!destination) return null;
  // English canonical URLs are unprefixed; avoid a second redirect.
  return `${prefix.replace(/^\/en\//, "/")}${destination}`;
}
