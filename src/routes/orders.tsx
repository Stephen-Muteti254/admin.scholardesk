import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/orders";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Material Orders | ScholarEdge Admin" },
      { name: "description", content: "Track material purchases, refunds and disputes." },
      { property: "og:title", content: "Material Orders | ScholarEdge Admin" },
      { property: "og:description", content: "Track material purchases, refunds and disputes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
