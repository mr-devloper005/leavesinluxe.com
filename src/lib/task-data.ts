import { SITE_CONFIG, type TaskKey } from "./site-config";
import { fetchSiteFeed, fetchSitePost, type SiteFeed, type SiteFeedPagination, type SitePost } from "./site-connector";
import { getMockPostsForTask } from "./mock-posts";
import { isValidCategory, normalizeCategory } from "./categories";

const getTaskContentType = (task: TaskKey) =>
  SITE_CONFIG.tasks.find((item) => item.key === task)?.contentType || task;

const getPostType = (post: SitePost) => {
  const content = post.content && typeof post.content === "object" ? post.content : {};
  const explicit = typeof (content as any).type === "string" ? String((content as any).type) : "";
  if (explicit) return explicit;
  if (Array.isArray(post.tags)) {
    const knownTypes = new Set(SITE_CONFIG.tasks.flatMap((task) => [task.key, task.contentType]));
    const tag = post.tags.find((item) => typeof item === "string" && knownTypes.has(item as TaskKey));
    if (tag) return tag;
  }
  return "";
};


const matchesTaskContentType = (post: SitePost, type: string) => {
  const postType = getPostType(post);
  // Older/public API payloads can omit task/type even when the feed endpoint was already scoped by task.
  // In that case, trust the current route/feed task instead of hiding a valid post as 404.
  return !postType || postType === type;
};

export const getPostTaskKey = (post: SitePost): TaskKey | null => {
  const postType = getPostType(post);
  if (!postType) {
    const enabledTasks = SITE_CONFIG.tasks.filter((task) => task.enabled);
    return enabledTasks.length === 1 ? enabledTasks[0].key : null;
  }
  const matched = SITE_CONFIG.tasks.find((task) => task.contentType === postType);
  if (matched) return matched.key;
  const direct = SITE_CONFIG.tasks.find((task) => task.key === (postType as TaskKey));
  return direct?.key || null;
};


export const groupPostsByTask = (posts: SitePost[], limitPerTask = 8) => {
  const grouped = new Map<TaskKey, SitePost[]>();
  for (const post of posts) {
    const task = getPostTaskKey(post);
    if (!task) continue;
    const current = grouped.get(task) || [];
    if (current.length >= limitPerTask) continue;
    current.push(post);
    grouped.set(task, current);
  }
  return grouped;
};

export const fetchHomeTaskFeed = async (limitPerTask = 8, options?: { fresh?: boolean; timeoutMs?: number }) => {
  const feed = await fetchSiteFeed(Math.min(80, Math.max(40, limitPerTask * SITE_CONFIG.tasks.length * 2)), {
    fresh: options?.fresh,
    timeoutMs: options?.timeoutMs ?? 2500,
  });
  const grouped = groupPostsByTask(feed?.posts || [], limitPerTask);
  return SITE_CONFIG.tasks
    .filter((task) => task.enabled)
    .map((task) => ({ task, posts: grouped.get(task.key) || [] }))
    .filter(({ posts }) => posts.length);
};

export type PaginatedTaskPosts = {
  posts: SitePost[];
  pagination: SiteFeedPagination;
};

const fallbackPagination = (page: number, limit: number, total: number): SiteFeedPagination => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
  };
};

export const fetchPaginatedTaskPosts = async (
  task: TaskKey,
  options?: { page?: number; limit?: number; category?: string; fresh?: boolean }
): Promise<PaginatedTaskPosts> => {
  const page = Math.max(1, Math.floor(Number(options?.page) || 1));
  const limit = Math.min(Math.max(Math.floor(Number(options?.limit) || 24), 1), 100);
  const normalizedCategory = options?.category ? normalizeCategory(options.category) : "all";
  const category = normalizedCategory === "all" ? undefined : normalizedCategory;
  const type = getTaskContentType(task);

  const pickTaskPosts = (feed: SiteFeed<SitePost> | null) => {
    if (!feed) return [];
    return feed.posts.filter((post) => {
      const status =
        typeof (post as any).status === "string"
          ? String((post as any).status).toUpperCase()
          : "";
      if (status && status !== "PUBLISHED") return false;
      if (!matchesTaskContentType(post, type)) return false;
      const content = post.content && typeof post.content === "object" ? post.content : {};
      const postCategory = typeof (content as any).category === "string" ? (content as any).category : "";
      if (postCategory && !isValidCategory(postCategory)) return false;
      return !category || normalizeCategory(postCategory) === category;
    });
  };

  try {
    const feed = await fetchSiteFeed(limit, {
      task: type,
      category,
      page,
      fresh: options?.fresh,
      timeoutMs: 5000,
    });
    const posts = pickTaskPosts(feed);
    return {
      posts,
      pagination: feed?.pagination || fallbackPagination(page, limit, page === 1 ? posts.length : (page - 1) * limit + posts.length),
    };
  } catch {
    return { posts: [], pagination: fallbackPagination(page, limit, 0) };
  }
};

export type HomeTimeSection = {
  key: string;
  title: string;
  eyebrow: string;
  description: string;
  task: TaskKey;
  posts: SitePost[];
  href: string;
};

export const fetchHomeTimeSections = async (
  task: TaskKey,
  options?: { limit?: number; timeoutMs?: number }
): Promise<HomeTimeSection[]> => {
  const limit = Math.min(Math.max(Math.floor(Number(options?.limit) || 8), 1), 16);
  const type = getTaskContentType(task);
  const route = SITE_CONFIG.taskViews[task] || `/${task}`;
  const windows = [
    { key: "spotlight", title: "Editor spotlight", eyebrow: "Featured stream", description: "A strong lead module for visitors who want something worth opening first.", toDays: 7, fromDays: undefined },
    { key: "browse", title: "Browse the collection", eyebrow: "Deep collection", description: "A denser browse lane that makes the site feel full of useful content.", toDays: 30, fromDays: 7 },
    { key: "index", title: "From the index", eyebrow: "More to explore", description: "A compact index-style section for older evergreen content and long-tail discovery.", toDays: undefined, fromDays: 30 },
  ];

  const feeds = await Promise.all(
    windows.map((window) =>
      fetchSiteFeed(limit, {
        task: type,
        toDays: window.toDays,
        fromDays: window.fromDays,
        timeoutMs: options?.timeoutMs ?? 4000,
      }).catch(() => null)
    )
  );

  return windows
    .map((window, index) => {
      const posts = (feeds[index]?.posts || []).filter((post) => matchesTaskContentType(post, type)).slice(0, limit);
      return {
        key: window.key,
        title: window.title,
        eyebrow: window.eyebrow,
        description: window.description,
        task,
        posts,
        href: route,
      };
    })
    .filter((section) => section.posts.length);
};

export const fetchTaskPosts = async (
  task: TaskKey,
  limit = 8,
  options?: { allowMockFallback?: boolean; fresh?: boolean }
) => {
  const allowMockFallback = options?.allowMockFallback ?? process.env.NEXT_PUBLIC_USE_MOCK_CONTENT === "true";
  const type = getTaskContentType(task);
  const pickTaskPosts = (feed: SiteFeed<SitePost> | null) => {
    if (!feed) return [];
    return feed.posts
      .filter((post) => {
        const status =
          typeof (post as any).status === "string"
            ? String((post as any).status).toUpperCase()
            : "";
        if (status && status !== "PUBLISHED") return false;
        if (!matchesTaskContentType(post, type)) return false;
        const content = post.content && typeof post.content === "object" ? post.content : {};
        const category = typeof (content as any).category === "string" ? (content as any).category : "";
        return !category || isValidCategory(category);
      })
      .slice(0, limit);
  };

  try {
    const cachedFeed = await fetchSiteFeed(limit * 6, { fresh: options?.fresh });
    const cachedPosts = pickTaskPosts(cachedFeed);
    if (cachedPosts.length) return cachedPosts;

    const freshFeed = await fetchSiteFeed(limit * 6, { fresh: true });
    const filtered = pickTaskPosts(freshFeed);
    return filtered.length || !allowMockFallback
      ? filtered
      : getMockPostsForTask(task).slice(0, limit);
  } catch {
    return allowMockFallback ? getMockPostsForTask(task).slice(0, limit) : [];
  }
};

export const fetchTaskPostBySlug = async (task: TaskKey, slug: string) => {
  const allowMockFallback = process.env.NEXT_PUBLIC_USE_MOCK_CONTENT === "true";
  const type = getTaskContentType(task);
  const resolveFromFeed = (feed: SiteFeed<SitePost> | null) =>
    feed?.posts.find((post) => post.slug === slug && matchesTaskContentType(post, type)) || null;

  try {
    const direct = await fetchSitePost<SitePost>(slug, { task: type });
    if (direct?.post && matchesTaskContentType(direct.post, type)) return direct.post;

    const freshDirect = await fetchSitePost<SitePost>(slug, { fresh: true, task: type });
    if (freshDirect?.post && matchesTaskContentType(freshDirect.post, type)) return freshDirect.post;

    // Legacy fallback only: useful when old master-panel versions do not expose /post/:slug.
    const cachedFeed = await fetchSiteFeed(1000, { task: type });
    const cachedMatch = resolveFromFeed(cachedFeed);
    if (cachedMatch) return cachedMatch;

    const freshFeed = await fetchSiteFeed(1000, { fresh: true, task: type });
    const freshMatch = resolveFromFeed(freshFeed);
    if (freshMatch) return freshMatch;

    // Some legacy AI-posting records are present in the public site feed but do not expose
    // task/type metadata, so task-scoped endpoints can miss them. Use exact slug as the
    // final source of truth before returning 404.
    const unscopedFeed = await fetchSiteFeed(1000, { fresh: true });
    const unscopedMatch = resolveFromFeed(unscopedFeed);
    if (unscopedMatch) return unscopedMatch;
  } catch {
    // fall through to optional mock data
  }

  return allowMockFallback
    ? getMockPostsForTask(task).find((post) => post.slug === slug) || null
    : null;
};


export type ArticleCommentPost = {
  id: string;
  name: string;
  comment: string;
  createdAt: string;
  articleSlug: string;
};

export const fetchArticleComments = async (articleSlug: string, limit = 50): Promise<ArticleCommentPost[]> => {
  const safeSlug = String(articleSlug || "").trim();
  if (!safeSlug) return [];

  try {
    const feed = await fetchSiteFeed<SitePost>(Math.max(20, Math.min(limit * 3, 200)), {
      task: "comment",
      timeoutMs: 2500,
    });

    return (feed?.posts || [])
      .filter((post) => {
        const content = post.content && typeof post.content === "object" ? post.content : {};
        const record = content as Record<string, unknown>;
        return String(record.articleSlug || "").trim() === safeSlug;
      })
      .slice(0, limit)
      .map((post) => {
        const content = post.content && typeof post.content === "object" ? post.content : {};
        const record = content as Record<string, unknown>;
        const comment =
          (typeof record.comment === "string" && record.comment.trim()) ||
          (typeof record.description === "string" && record.description.trim()) ||
          (typeof record.body === "string" && record.body.trim()) ||
          post.summary ||
          post.title;
        return {
          id: post.id,
          name:
            (typeof record.name === "string" && record.name.trim()) ||
            (typeof record.author === "string" && record.author.trim()) ||
            post.authorName ||
            "Reader",
          comment,
          createdAt: post.publishedAt || post.createdAt || new Date().toISOString(),
          articleSlug: safeSlug,
        };
      });
  } catch {
    return [];
  }
};

export const buildPostUrl = (task: TaskKey, slug: string) => {
  const view = SITE_CONFIG.taskViews[task] || "/posts";
  return `${view}/${slug}`;
};

const isValidImageUrl = (value?: string | null) =>
  typeof value === "string" && (value.startsWith("/") || /^https?:\/\//i.test(value));

export const getPostImages = (post: SitePost): string[] => {
  const media = Array.isArray(post.media) ? post.media : [];
  const mediaUrls = media
    .map((item) => item?.url)
    .filter((url): url is string => isValidImageUrl(url));
  const content = post.content && typeof post.content === "object" ? post.content : {};
  const contentAny = content as Record<string, unknown>;
  const contentImage =
    typeof contentAny.image === "string" ? contentAny.image : null;
  const contentImages = Array.isArray(contentAny.images)
    ? contentAny.images.filter((url): url is string => isValidImageUrl(url))
    : [];
  const contentLogo =
    typeof contentAny.logo === "string" ? contentAny.logo : null;

  return [
    ...mediaUrls,
    ...contentImages,
    ...(isValidImageUrl(contentImage) ? [contentImage as string] : []),
    ...(isValidImageUrl(contentLogo) ? [contentLogo as string] : []),
  ];
};
