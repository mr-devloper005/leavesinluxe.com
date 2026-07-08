export type SitePost = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  content?: Record<string, unknown> | null;
  media?: Array<{ url: string; type?: string }>;
  tags?: string[];
  authorName?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SiteBootstrap = {
  site: {
    id: string;
    code: string;
    name: string;
    config?: Record<string, unknown>;
  };
  blueprint?: Record<string, unknown>;
};

export type SiteFeedPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

export type SiteFeed<TPost = SitePost> = {
  site: SiteBootstrap["site"];
  posts: TPost[];
  pagination?: SiteFeedPagination;
};

const API_BASE =
  process.env.NEXT_PUBLIC_MASTER_API_URL ||
  process.env.NEXT_PUBLIC_MASTER_PANEL_URL;
const SITE_CODE = process.env.NEXT_PUBLIC_SITE_CODE;
const FEED_REVALIDATE_SECONDS = (() => {
  const parsed = Number(process.env.NEXT_PUBLIC_FEED_REVALIDATE_SECONDS ?? 300);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
})();
const REQUEST_TIMEOUT_MS = (() => {
  const parsed = Number(process.env.NEXT_PUBLIC_PUBLIC_API_TIMEOUT_MS ?? 8000);
  return Number.isFinite(parsed) && parsed >= 1000 ? parsed : 8000;
})();
const STALE_FALLBACK_SECONDS = (() => {
  const parsed = Number(process.env.NEXT_PUBLIC_STALE_FALLBACK_SECONDS ?? 86400);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 86400;
})();

const memoryFallback = new Map<string, { data: unknown; savedAt: number }>();

const getPublicUrl = (path: string) => {
  if (!API_BASE || !SITE_CODE) return null;
  return `${API_BASE.replace(/\/$/, "")}/api/v1/public/${SITE_CODE}${path}`;
};

const saveMemoryFallback = (key: string, data: unknown) => {
  memoryFallback.set(key, { data, savedAt: Date.now() });
};

const readMemoryFallback = <T>(key: string): T | null => {
  const cached = memoryFallback.get(key);
  if (!cached) return null;
  const ageSeconds = (Date.now() - cached.savedAt) / 1000;
  if (ageSeconds > STALE_FALLBACK_SECONDS) return null;
  return cached.data as T;
};

async function fetchPublicJson<T>(path: string, options?: { fresh?: boolean; timeoutMs?: number }): Promise<T | null> {
  const target = getPublicUrl(path);
  if (!target) return null;

  try {
    const signal =
      typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
        ? AbortSignal.timeout(options?.timeoutMs || REQUEST_TIMEOUT_MS)
        : undefined;
    const response = await fetch(target, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
      ...(options?.fresh ? { cache: "no-store" } : { next: { revalidate: FEED_REVALIDATE_SECONDS } }),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Public connector request failed (${response.status}) for ${target}`);
      }
      return readMemoryFallback<T>(target);
    }

    const json = (await response.json()) as { success: boolean; data?: T };
    const data = json.data || null;
    if (data) saveMemoryFallback(target, data);
    return data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && !(error instanceof DOMException && error.name === "TimeoutError")) {
      console.warn("Public connector request failed", error);
    }
    return readMemoryFallback<T>(target);
  }
}

export async function fetchSiteBootstrap(options?: { fresh?: boolean }): Promise<SiteBootstrap | null> {
  return fetchPublicJson<SiteBootstrap>("/bootstrap", options);
}


export async function fetchSitePost<TPost = SitePost>(
  slug: string,
  options?: { fresh?: boolean; task?: string; timeoutMs?: number }
): Promise<(SiteBootstrap & { post: TPost }) | null> {
  const safeSlug = String(slug || "").trim();
  if (!safeSlug) return null;
  const params = new URLSearchParams();
  if (typeof options?.task === "string" && options.task.trim()) {
    params.set("task", options.task.trim().toLowerCase());
  }
  const query = params.toString();
  return fetchPublicJson<SiteBootstrap & { post: TPost }>(
    `/post/${encodeURIComponent(safeSlug)}${query ? `?${query}` : ""}`,
    options
  );
}

export async function fetchSiteFeed<TPost = SitePost>(
  limit = 50,
  options?: { fresh?: boolean; category?: string; task?: string; page?: number; fromDays?: number; toDays?: number; timeoutMs?: number }
): Promise<SiteFeed<TPost> | null> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (typeof options?.page === "number" && Number.isFinite(options.page) && options.page > 1) {
    params.set("page", String(Math.floor(options.page)));
  }
  if (typeof options?.fromDays === "number" && Number.isFinite(options.fromDays) && options.fromDays > 0) {
    params.set("fromDays", String(Math.floor(options.fromDays)));
  }
  if (typeof options?.toDays === "number" && Number.isFinite(options.toDays) && options.toDays > 0) {
    params.set("toDays", String(Math.floor(options.toDays)));
  }
  if (typeof options?.category === "string" && options.category.trim()) {
    params.set("category", options.category.trim().toLowerCase());
  }
  if (typeof options?.task === "string" && options.task.trim()) {
    params.set("task", options.task.trim().toLowerCase());
  }
  return fetchPublicJson<SiteFeed<TPost>>(`/feed?${params.toString()}`, options);
}

export type SiteAd = {
  id: string;
  name: string;
  imageUrl: string;
  mediaType?: "image" | "video" | string;
  linkUrl: string;
  altText?: string | null;
  openInNewTab?: boolean;
  slot: string;
  width?: number | null;
  height?: number | null;
  priority?: number;
  weight?: number;
  durationMs?: number | null;
};

/**
 * Fetch ads targeted to this site (by SITE_CODE) from the Master Panel.
 * Targeting / scheduling / ordering is resolved server-side. Pass a `slot` to
 * scope to one placement (e.g. "sidebar"). Returns [] on any error/misconfig.
 */
export async function fetchSiteAds(
  slot?: string,
  options?: { fresh?: boolean; timeoutMs?: number }
): Promise<SiteAd[]> {
  const safeSlot = typeof slot === "string" ? slot.trim() : "";
  const path = safeSlot ? `/ads?slot=${encodeURIComponent(safeSlot)}` : "/ads";
  const ads = await fetchPublicJson<SiteAd[]>(path, options);
  return Array.isArray(ads) ? ads : [];
}
