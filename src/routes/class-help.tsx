import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/class-help";

export const Route = createFileRoute("/class-help")({
  head: () => ({
    meta: [
      { title: "Class Help Queue | ScholarEdge Admin" },
      { name: "description", content: "Manage full-class engagements, milestones and quotes." },
      { property: "og:title", content: "Class Help Queue | ScholarEdge Admin" },
      { property: "og:description", content: "Manage full-class engagements, milestones and quotes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
