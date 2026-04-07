import type { MetadataRoute } from "next";

import { fetchSiteFeed, type SitePost } from "@/lib/site-connector";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE_URL = SITE_CONFIG.baseUrl.replace(/\/$/, "");
const EXCLUDED_SLUG_PREFIXES = ["example-", "test-"];

type SitemapEntry = MetadataRoute.Sitemap[number];

type StaticSitemapRoute = {
  path: string;
  changeFrequency: SitemapEntry["changeFrequency"];
  priority: number;
};

const STATIC_ROUTES: StaticSitemapRoute[] = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/listings", changeFrequency: "daily", priority: 0.95 },
  { path: "/articles", changeFrequency: "daily", priority: 0.95 },
  { path: "/classifieds", changeFrequency: "daily", priority: 0.88 },
  { path: "/image-sharing", changeFrequency: "daily", priority: 0.88 },
  { path: "/profile", changeFrequency: "daily", priority: 0.82 },
  { path: "/sbm", changeFrequency: "daily", priority: 0.82 },
  { path: "/pdf", changeFrequency: "daily", priority: 0.82 },
];

const getTaskFromPost = (post: SitePost) => {
  const content = post.content && typeof post.content === "object" ? post.content : {};
  const explicitType =
    typeof (content as { type?: unknown }).type === "string"
      ? String((content as { type?: string }).type)
      : "";

  if (explicitType.trim()) return explicitType.trim().toLowerCase();

  if (Array.isArray(post.tags)) {
    const fromTag = post.tags.find((tag) => typeof tag === "string" && tag.trim());
    if (fromTag) return String(fromTag).trim().toLowerCase();
  }

  return "";
};

const getFreshestDate = (post: SitePost, fallback: Date) => {
  const candidates = [post.updatedAt, post.publishedAt, post.createdAt];
  for (const value of candidates) {
    if (typeof value !== "string" || !value.trim()) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return fallback;
};

const shouldExcludePost = (post: SitePost, task: string) => {
  const slug = typeof post.slug === "string" ? post.slug.trim().toLowerCase() : "";
  if (!slug) return true;
  if (task === "comment") return true;
  return EXCLUDED_SLUG_PREFIXES.some((prefix) => slug.startsWith(prefix));
};

const dedupeEntries = (entries: MetadataRoute.Sitemap) => {
  const deduped = new Map<string, SitemapEntry>();

  for (const entry of entries) {
    if (!entry?.url) continue;
    const existing = deduped.get(entry.url);
    if (!existing) {
      deduped.set(entry.url, entry);
      continue;
    }

    const existingTime = existing.lastModified ? new Date(existing.lastModified).getTime() : 0;
    const currentTime = entry.lastModified ? new Date(entry.lastModified).getTime() : 0;

    if (currentTime >= existingTime) {
      deduped.set(entry.url, { ...existing, ...entry });
    }
  }

  return Array.from(deduped.values());
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const feed = await fetchSiteFeed(1000, { fresh: true });

  const taskRouteMap = new Map<string, string>(
    Object.entries(SITE_CONFIG.taskViews).map(([task, route]) => [
      String(task).toLowerCase(),
      route || "/posts",
    ])
  );

  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const postRoutes: MetadataRoute.Sitemap = (feed?.posts || [])
    .map((post) => ({ post, task: getTaskFromPost(post) }))
    .filter(({ post, task }) => !shouldExcludePost(post, task))
    .map(({ post, task }) => {
      const route = taskRouteMap.get(task) || "/posts";
      const lastModified = getFreshestDate(post, now);
      return {
        url: `${BASE_URL}${route}/${post.slug}`,
        lastModified,
        changeFrequency: "hourly" as const,
        priority: task === "listing" || task === "article" ? 0.9 : 0.82,
      };
    });

  return dedupeEntries([...staticRoutes, ...postRoutes]);
}
