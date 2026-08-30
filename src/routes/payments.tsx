import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/payments";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments & Payouts | ScholarEdge Admin" },
      { name: "description", content: "Expert payout cycles, processing status and settlement records." },
      { property: "og:title", content: "Payments & Payouts | ScholarEdge Admin" },
      { property: "og:description", content: "Expert payout cycles, processing status and settlement records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
