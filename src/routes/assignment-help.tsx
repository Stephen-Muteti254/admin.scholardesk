import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/assignment-help";

export const Route = createFileRoute("/assignment-help")({
  head: () => ({
    meta: [
      { title: "Assignment Help Queue | ScholarEdge Admin" },
      { name: "description", content: "Quote, assign and deliver individual assignment requests." },
      { property: "og:title", content: "Assignment Help Queue | ScholarEdge Admin" },
      { property: "og:description", content: "Quote, assign and deliver individual assignment requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
