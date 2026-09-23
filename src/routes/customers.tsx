import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/customers";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers | ScholarDesk Admin" },
      { name: "description", content: "Customer records, spend history and account status." },
      { property: "og:title", content: "Customers | ScholarDesk Admin" },
      { property: "og:description", content: "Customer records, spend history and account status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
