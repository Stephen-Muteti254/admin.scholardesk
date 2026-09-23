import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/materials";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Exam Materials | ScholarDesk Admin" },
      { name: "description", content: "Author, review and publish exam material packs with pricing and downloads." },
      { property: "og:title", content: "Exam Materials | ScholarDesk Admin" },
      { property: "og:description", content: "Author, review and publish exam material packs with pricing and downloads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
