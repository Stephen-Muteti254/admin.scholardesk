import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Team | ScholarEdge Admin" },
      { name: "description", content: "Configure pricing, notifications, integrations and admin roles." },
      { property: "og:title", content: "Settings & Team | ScholarEdge Admin" },
      { property: "og:description", content: "Configure pricing, notifications, integrations and admin roles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
