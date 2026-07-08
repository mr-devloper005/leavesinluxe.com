import type { TaskKey } from "@/lib/site-config";

export const slot4TaskSupport = {
  article: false,
  classified: true,
  sbm: false,
  profile: true,
  pdf: false,
  listing: false,
  image: false,
} satisfies Record<TaskKey, boolean>;

export const slot4TaskNotes = {
  article: "Article pages and article detail backlinks",
  classified: "Classified ads pages and detail backlinks",
  sbm: "Social bookmarking pages and detail backlinks",
  profile: "Profile/user pages",
  pdf: "PDF/document pages and detail backlinks",
  listing: "Business listing pages and detail backlinks",
  image: "Image/gallery pages and detail backlinks",
} satisfies Record<TaskKey, string>;
