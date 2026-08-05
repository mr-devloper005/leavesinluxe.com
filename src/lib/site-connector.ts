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

// Returns the payload AND the upstream HTTP status so callers can tell a definitive
// "gone" (404/410) apart from a transient outage. The in-memory fallback is an
// OUTAGE-resilience feature (keep serving last-known-good while the API blips) — it
// must NEVER resurrect content the API has deliberately removed. So on a 404/410 we
// drop any held fallback and report the resource as gone; the memory fallback is
// only served for transient failures (5xx/429/network error/timeout).
async function fetchPublicJsonEx<T>(
  path: string,
  options?: { fresh?: boolean; timeoutMs?: number }
): Promise<{ data: T | null; status: number | null }> {
  const target = getPublicUrl(path);
  if (!target) return { data: null, status: null };

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
      // Definitively gone upstream (deleted): never serve stale, evict the fallback.
      if (response.status === 404 || response.status === 410) {
        memoryFallback.delete(target);
        return { data: null, status: response.status };
      }
      // Transient upstream failure: serve last-known-good if we still have it.
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Public connector request failed (${response.status}) for ${target}`);
      }
      return { data: readMemoryFallback<T>(target), status: response.status };
    }

    const json = (await response.json()) as { success: boolean; data?: T };
    const data = json.data || null;
    if (data) saveMemoryFallback(target, data);
    return { data, status: response.status };
  } catch (error) {
    if (process.env.NODE_ENV !== "production" && !(error instanceof DOMException && error.name === "TimeoutError")) {
      console.warn("Public connector request failed", error);
    }
    // Network error / timeout — treat as a transient outage, serve last-known-good.
    return { data: readMemoryFallback<T>(target), status: null };
  }
}

async function fetchPublicJson<T>(path: string, options?: { fresh?: boolean; timeoutMs?: number }): Promise<T | null> {
  return (await fetchPublicJsonEx<T>(path, options)).data;
}

export async function fetchSiteBootstrap(options?: { fresh?: boolean }): Promise<SiteBootstrap | null> {
  return fetchPublicJson<SiteBootstrap>("/bootstrap", options);
}


// Status-aware single-post fetch. `status === 404 | 410` means the master panel
// has definitively removed this post (deleted backlink) — the caller should 404
// immediately and must NOT fall back to a cached feed that may still list it.
export async function fetchSitePostResult<TPost = SitePost>(
  slug: string,
  options?: { fresh?: boolean; task?: string; timeoutMs?: number }
): Promise<{ data: (SiteBootstrap & { post: TPost }) | null; status: number | null }> {
  const safeSlug = String(slug || "").trim();
  if (!safeSlug) return { data: null, status: null };
  const params = new URLSearchParams();
  if (typeof options?.task === "string" && options.task.trim()) {
    params.set("task", options.task.trim().toLowerCase());
  }
  const query = params.toString();
  return fetchPublicJsonEx<SiteBootstrap & { post: TPost }>(
    `/post/${encodeURIComponent(safeSlug)}${query ? `?${query}` : ""}`,
    options
  );
}

export async function fetchSitePost<TPost = SitePost>(
  slug: string,
  options?: { fresh?: boolean; task?: string; timeoutMs?: number }
): Promise<(SiteBootstrap & { post: TPost }) | null> {
  return (await fetchSitePostResult<TPost>(slug, options)).data;
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
