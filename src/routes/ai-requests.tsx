import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/ai-requests";

export const Route = createFileRoute("/ai-requests")({
  head: () => ({
    meta: [
      { title: "AI & Plagiarism Queue | ScholarEdge Admin" },
      { name: "description", content: "Triage AI detection reports and AI/plagiarism removal jobs." },
      { property: "og:title", content: "AI & Plagiarism Queue | ScholarEdge Admin" },
      { property: "og:description", content: "Triage AI detection reports and AI/plagiarism removal jobs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
