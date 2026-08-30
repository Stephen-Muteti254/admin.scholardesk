import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/analytics";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics | ScholarEdge Admin" },
      { name: "description", content: "Revenue, request volume and conversion analytics for the ScholarEdge estate." },
      { property: "og:title", content: "Analytics | ScholarEdge Admin" },
      { property: "og:description", content: "Revenue, request volume and conversion analytics for the ScholarEdge estate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
