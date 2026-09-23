import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/expert-applications";

export const Route = createFileRoute("/expert-applications")({
  head: () => ({
    meta: [
      { title: "Expert applications | ScholarDesk Admin" },
      { name: "description", content: "Review, approve or reject incoming expert applications." },
      { property: "og:title", content: "Expert applications | ScholarDesk Admin" },
      { property: "og:description", content: "Review, approve or reject incoming expert applications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
