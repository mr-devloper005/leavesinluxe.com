import type { TaskKey } from "./site-config";
import type { SitePost } from "./site-connector";

const taskSeeds: Record<TaskKey, string> = {
  listing: "listing",
  classified: "classified",
  article: "article",
  image: "image",
  profile: "profile",
  pdf: "pdf",
  sbm: "sbm",
};

const taskTitles: Record<TaskKey, string[]> = {
  listing: [
    "Urban Coffee Studio",
    "Growth Labs Agency",
    "Northside Fitness",
    "PixelCraft Design",
    "Prime Auto Care",
  ],
  classified: [
    "Used MacBook Pro 16",
    "Studio Space for Rent",
    "Hiring Frontend Developer",
    "Weekend Photography Gig",
    "City Center Apartment",
  ],
  article: [
    "Scaling Local SEO in 2026",
    "The Future of Directory Sites",
    "Design Systems for Multi-Site",
    "From MVP to Marketplace",
    "Content Ops That Ship Fast",
  ],
  image: [
    "Golden Hour Interiors",
    "Mountain Trail Series",
    "Studio Portrait Set",
    "Neon Night Market",
    "Minimal Workspace",
  ],
  profile: [
    "Aisha Khan",
    "Rohan Patel",
    "Studio R&R",
    "Team Northwind",
    "Maya Desai",
  ],
  pdf: [
    "Local SEO Playbook",
    "Marketplace UX Guide",
    "Outbound Sales Template",
    "Agency Pricing Deck",
    "SaaS Metrics Cheatsheet",
  ],
  sbm: [
    "SEO Checklist 2026",
    "Directory Growth Tactics",
    "Backlink Outreach Vault",
    "AI Writing Tools List",
    "Local Listing Audit",
  ],
};

const taskCategories: Record<TaskKey, string[]> = {
  listing: ["Marketing", "Tech", "Design", "Fitness", "Automotive"],
  classified: ["Jobs", "Real Estate", "Services", "Gigs", "Market"],
  article: ["Strategy", "SEO", "Product", "Growth", "Ops"],
  image: ["Lifestyle", "Travel", "Studio", "Urban", "Minimal"],
  profile: ["Founder", "Creator", "Agency", "Team", "Consultant"],
  pdf: ["Guides", "Playbooks", "Templates", "Reports", "Docs"],
  sbm: ["Bookmarks", "Tools", "Resources", "SEO", "Research"],
};

const summaryByTask: Record<TaskKey, string> = {
  listing: "Verified business listing with trusted details.",
  classified: "Fresh deal posted by a verified seller.",
  article: "Long-form insight from industry experts.",
  image: "Curated visual story and gallery.",
  profile: "Featured creator profile and highlights.",
  pdf: "Downloadable resource for your team.",
  sbm: "Curated bookmark collection entry.",
};

const randomFrom = (items: string[], index: number) =>
  items[index % items.length];

const buildImage = (task: TaskKey, index: number) =>
  `https://picsum.photos/seed/${taskSeeds[task]}-${index}/1200/800`;

export const getMockPostsForTask = (task: TaskKey): SitePost[] => {
  return Array.from({ length: 5 }).map((_, index) => {
    const title = taskTitles[task][index];
    const category = randomFrom(taskCategories[task], index);
    const slug = `${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return {
      id: `${task}-mock-${index + 1}`,
      title,
      slug,
      summary: summaryByTask[task],
      content: {
        type: task,
        category,
        location: "Delhi",
        description: summaryByTask[task],
        website: "https://example.com",
        phone: "+91-9999999999",
      },
      media: [{ url: buildImage(task, index), type: "IMAGE" }],
      tags: [task, category],
      authorName: "Site Master Pro",
      publishedAt: new Date().toISOString(),
    };
  });
};
