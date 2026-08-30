import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/exam-help";

export const Route = createFileRoute("/exam-help")({
  head: () => ({
    meta: [
      { title: "Exam & Interview Queue | ScholarEdge Admin" },
      { name: "description", content: "Expert bookings and ExamStealth self-serve sittings." },
      { property: "og:title", content: "Exam & Interview Queue | ScholarEdge Admin" },
      { property: "og:description", content: "Expert bookings and ExamStealth self-serve sittings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
