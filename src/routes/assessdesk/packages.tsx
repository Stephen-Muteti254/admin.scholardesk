import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/assessdesk-packages";

export const Route = createFileRoute("/assessdesk/packages")({
  head: () => ({
    meta: [
      { title: "AssessDesk Tokens & Packages | ScholarDesk Admin" },
      { name: "description", content: "Manage AssessDesk question packages, Paystack purchases and usage." },
      { property: "og:title", content: "AssessDesk Tokens & Packages | ScholarDesk Admin" },
      { property: "og:description", content: "Manage AssessDesk question packages, Paystack purchases and usage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
