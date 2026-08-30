import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScholarEdge Admin | Operations Dashboard" },
      { name: "description", content: "Live view of revenue, service queues, SLA health and expert workload across ScholarEdge." },
      { property: "og:title", content: "ScholarEdge Admin | Operations Dashboard" },
      { property: "og:description", content: "Live view of revenue, service queues, SLA health and expert workload across ScholarEdge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
