import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/assessdesk-users";

export const Route = createFileRoute("/assessdesk/users")({
  head: () => ({
    meta: [
      { title: "AssessDesk Users & Grants | ScholarDesk Admin" },
      { name: "description", content: "AssessDesk users, question grants, expiry and grace windows." },
      { property: "og:title", content: "AssessDesk Users & Grants | ScholarDesk Admin" },
      { property: "og:description", content: "AssessDesk users, question grants, expiry and grace windows." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
