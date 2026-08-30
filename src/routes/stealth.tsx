import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/stealth";

export const Route = createFileRoute("/stealth")({
  head: () => ({
    meta: [
      { title: "ExamStealth Licences | ScholarEdge Admin" },
      { name: "description", content: "Issue, monitor and revoke ExamStealth licences and devices." },
      { property: "og:title", content: "ExamStealth Licences | ScholarEdge Admin" },
      { property: "og:description", content: "Issue, monitor and revoke ExamStealth licences and devices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
