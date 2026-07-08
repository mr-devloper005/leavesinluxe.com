"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TaskPostCard } from "@/components/shared/task-post-card";
import { buildPostUrl } from "@/lib/task-data";
import { normalizeCategory, isValidCategory } from "@/lib/categories";
import type { TaskKey } from "@/lib/site-config";
import type { SiteFeedPagination, SitePost } from "@/lib/site-connector";
import type { LocalPost } from "@/lib/local-posts";
import { getLocalPostsForTask } from "@/lib/local-posts";

type Props = {
  task: TaskKey;
  initialPosts: SitePost[];
  category?: string;
  pagination?: SiteFeedPagination;
  basePath?: string;
};

const buildPageHref = (basePath: string, page: number, category?: string) => {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};

function PaginationControls({ pagination, basePath, category }: { pagination?: SiteFeedPagination; basePath: string; category?: string }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const current = pagination.page;
  const total = pagination.totalPages;
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-background/80 p-4 text-sm shadow-sm sm:flex-row" aria-label="Posts pagination">
      <p className="text-muted-foreground">
        Page <span className="font-semibold text-foreground">{current}</span> of{" "}
        <span className="font-semibold text-foreground">{total}</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href={buildPageHref(basePath, Math.max(1, current - 1), category)}
          aria-disabled={!pagination.hasPrevPage}
          className={`inline-flex h-10 items-center gap-1 rounded-full border px-4 font-medium transition ${
            pagination.hasPrevPage
              ? "border-border bg-background text-foreground hover:bg-muted"
              : "pointer-events-none border-border/60 bg-muted/50 text-muted-foreground/60"
          }`}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Link>
        {start > 1 ? (
          <>
            <Link href={buildPageHref(basePath, 1, category)} className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-border bg-background px-3 font-medium hover:bg-muted">1</Link>
            <span className="px-1 text-muted-foreground">...</span>
          </>
        ) : null}
        {pages.map((item) => (
          <Link
            key={item}
            href={buildPageHref(basePath, item, category)}
            aria-current={item === current ? "page" : undefined}
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 font-medium transition ${
              item === current
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            {item}
          </Link>
        ))}
        {end < total ? (
          <>
            <span className="px-1 text-muted-foreground">...</span>
            <Link href={buildPageHref(basePath, total, category)} className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-border bg-background px-3 font-medium hover:bg-muted">{total}</Link>
          </>
        ) : null}
        <Link
          href={buildPageHref(basePath, Math.min(total, current + 1), category)}
          aria-disabled={!pagination.hasNextPage}
          className={`inline-flex h-10 items-center gap-1 rounded-full border px-4 font-medium transition ${
            pagination.hasNextPage
              ? "border-border bg-background text-foreground hover:bg-muted"
              : "pointer-events-none border-border/60 bg-muted/50 text-muted-foreground/60"
          }`}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}

export function TaskListClient({ task, initialPosts, category, pagination, basePath }: Props) {
  const [localPosts, setLocalPosts] = useState<LocalPost[]>([])

  useEffect(() => {
    setLocalPosts(getLocalPostsForTask(task))
  }, [task])

  const merged = useMemo(() => {
    const bySlug = new Set<string>();
    const combined: Array<SitePost & { localOnly?: boolean; task?: TaskKey }> = [];

    if (!pagination || pagination.page === 1) {
      localPosts.forEach((post) => {
        if (post.slug) {
          bySlug.add(post.slug);
        }
        combined.push(post);
      });
    }

    initialPosts.forEach((post) => {
      if (post.slug && bySlug.has(post.slug)) return;
      combined.push(post);
    });

    const normalizedCategory = category ? normalizeCategory(category) : "all";
    if (normalizedCategory === "all") {
      return combined.filter((post) => {
        const content = post.content && typeof post.content === "object" ? post.content : {};
        const value = typeof (content as any).category === "string" ? (content as any).category : "";
        return !value || isValidCategory(value);
      });
    }

    return combined.filter((post) => {
      const content = post.content && typeof post.content === "object" ? post.content : {};
      const value =
        typeof (content as any).category === "string"
          ? normalizeCategory((content as any).category)
          : "";
      return value === normalizedCategory;
    });
  }, [category, initialPosts, localPosts, pagination]);

  if (!merged.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        No posts yet for this section.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {merged.map((post) => {
          const localOnly = (post as any).localOnly;
          const href = localOnly
            ? `/local/${task}/${post.slug}`
            : buildPostUrl(task, post.slug);
          return <TaskPostCard key={post.id} post={post} href={href} taskKey={task} />;
        })}
      </div>
      <PaginationControls pagination={pagination} basePath={basePath || `/${task}`} category={category} />
    </>
  );
}
