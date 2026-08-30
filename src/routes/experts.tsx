import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/experts";

export const Route = createFileRoute("/experts")({
  head: () => ({
    meta: [
      { title: "Experts | ScholarEdge Admin" },
      { name: "description", content: "Expert roster, workload, ratings and payout balances." },
      { property: "og:title", content: "Experts | ScholarEdge Admin" },
      { property: "og:description", content: "Expert roster, workload, ratings and payout balances." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
