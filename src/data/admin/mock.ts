/* ------------------------------------------------------------------
 * Mock data for the ScholarEdge admin console.
 * Purely for visualisation — swap for API responses (see services/).
 * ----------------------------------------------------------------*/

export type RequestType = "ai-report" | "ai-removal" | "class" | "assignment" | "exam" | "interview";

export type RequestStatus =
  | "new"
  | "reviewing"
  | "quoted"
  | "awaiting-payment"
  | "in-progress"
  | "delivered"
  | "revision"
  | "completed"
  | "cancelled"
  | "refunded";

export type Priority = "low" | "normal" | "high" | "urgent";

export type Attachment = { id: string; name: string; size: string; kind: string };

export type Message = {
  id: string;
  author: string;
  role: "admin" | "customer" | "expert";
  body: string;
  at: string;
  attachments?: Attachment[];
};

export type ActivityEntry = { id: string; at: string; actor: string; action: string };

export type Quote = {
  id: string;
  amount: number;
  currency: "USD";
  note: string;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  sentAt: string;
  expiresAt: string;
};

export type ServiceRequest = {
  id: string;
  ref: string;
  type: RequestType;
  title: string;
  customer: { id: string; name: string; email: string; country: string };
  subject: string;
  level: "High School" | "Undergraduate" | "Graduate" | "Professional";
  deadline: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;
  priority: Priority;
  assignedTo: string | null;
  budget: number | null;
  details: string;
  wordCount?: number;
  aiScore?: number;
  plagScore?: number;
  platform?: string;
  quotes: Quote[];
  attachments: Attachment[];
  messages: Message[];
  activity: ActivityEntry[];
  tags: string[];
};

export type MaterialRecord = {
  id: string;
  title: string;
  exam: string;
  subject: string;
  level: string;
  price: number;
  status: "draft" | "in-review" | "published" | "archived";
  pages: number;
  format: string;
  downloads: number;
  revenue: number;
  rating: number;
  author: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  ref: string;
  materialTitle: string;
  customer: { name: string; email: string };
  amount: number;
  gateway: "Stripe" | "PayPal" | "Bank Transfer" | "Wise";
  status: "paid" | "pending" | "failed" | "refunded" | "disputed";
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  country: string;
  joinedAt: string;
  requests: number;
  orders: number;
  spend: number;
  status: "active" | "pending" | "suspended" | "banned";
  lastActive: string;
};

export type Expert = {
  id: string;
  name: string;
  email: string;
  specialities: string[];
  rating: number;
  activeJobs: number;
  completed: number;
  payoutDue: number;
  status: "active" | "onboarding" | "paused" | "offboarded";
  joinedAt: string;
};

export type License = {
  id: string;
  key: string;
  customer: string;
  email: string;
  plan: "Trial" | "Single Exam" | "Semester" | "Enterprise";
  devices: number;
  maxDevices: number;
  status: "active" | "expired" | "revoked" | "pending";
  issuedAt: string;
  expiresAt: string;
  lastSeen: string;
  os: "Windows" | "macOS";
};

export type Payout = {
  id: string;
  expert: string;
  period: string;
  jobs: number;
  amount: number;
  method: "Wise" | "PayPal" | "Bank Transfer";
  status: "scheduled" | "processing" | "paid" | "on-hold";
  dueAt: string;
};

const now = new Date("2026-07-29T09:00:00Z");
const iso = (daysAgo: number, hours = 0) =>
  new Date(now.getTime() - daysAgo * 864e5 - hours * 36e5).toISOString();
const isoFuture = (days: number) => new Date(now.getTime() + days * 864e5).toISOString();

export const admins = [
  "Amara Okafor",
  "Daniel Whitmore",
  "Priya Raghunathan",
  "Lucas Silveira",
  "Unassigned",
];

export const experts: Expert[] = [
  {
    id: "e1",
    name: "Dr. Helen Mwangi",
    email: "helen.mwangi@scholaredge.example",
    specialities: ["Nursing", "Pharmacology", "NCLEX"],
    rating: 4.9,
    activeJobs: 4,
    completed: 218,
    payoutDue: 1840,
    status: "active",
    joinedAt: iso(620),
  },
  {
    id: "e2",
    name: "Marcus Feldman",
    email: "marcus.f@scholaredge.example",
    specialities: ["Accounting", "CPA", "Finance"],
    rating: 4.8,
    activeJobs: 3,
    completed: 164,
    payoutDue: 2260,
    status: "active",
    joinedAt: iso(410),
  },
  {
    id: "e3",
    name: "Sofia Marchetti",
    email: "sofia.m@scholaredge.example",
    specialities: ["Statistics", "GRE Quant", "Mathematics"],
    rating: 4.7,
    activeJobs: 6,
    completed: 301,
    payoutDue: 980,
    status: "active",
    joinedAt: iso(880),
  },
  {
    id: "e4",
    name: "Tunde Balogun",
    email: "tunde.b@scholaredge.example",
    specialities: ["Cloud Computing", "AWS", "System Design"],
    rating: 4.6,
    activeJobs: 1,
    completed: 77,
    payoutDue: 420,
    status: "onboarding",
    joinedAt: iso(24),
  },
  {
    id: "e5",
    name: "Grace Lim",
    email: "grace.lim@scholaredge.example",
    specialities: ["Interviews", "Behavioural", "Product"],
    rating: 4.9,
    activeJobs: 2,
    completed: 132,
    payoutDue: 0,
    status: "paused",
    joinedAt: iso(300),
  },
];

const msg = (
  id: string,
  role: Message["role"],
  author: string,
  body: string,
  at: string,
): Message => ({ id, role, author, body, at });

function baseActivity(ref: string): ActivityEntry[] {
  return [
    { id: `${ref}-a1`, at: iso(3), actor: "System", action: "Request received from website form" },
    { id: `${ref}-a2`, at: iso(2, 6), actor: "Amara Okafor", action: "Moved status to Reviewing" },
  ];
}

export const serviceRequests: ServiceRequest[] = [
  {
    id: "r1",
    ref: "SE-AIR-2041",
    type: "ai-report",
    title: "Dissertation chapter 3 — AI & plagiarism report",
    customer: { id: "c1", name: "Nadia Hassan", email: "nadia.hassan@mail.example", country: "UAE" },
    subject: "Public Health",
    level: "Graduate",
    deadline: isoFuture(1),
    createdAt: iso(0, 4),
    updatedAt: iso(0, 1),
    status: "new",
    priority: "urgent",
    assignedTo: null,
    budget: 45,
    wordCount: 6400,
    aiScore: 38,
    plagScore: 12,
    details:
      "Need a full similarity and AI-detection report for chapter 3 before my supervisor review on Friday.",
    quotes: [],
    attachments: [{ id: "f1", name: "chapter-3-draft.docx", size: "482 KB", kind: "DOCX" }],
    messages: [
      msg("m1", "customer", "Nadia Hassan", "Uploaded the latest draft — please prioritise.", iso(0, 4)),
    ],
    activity: [
      { id: "r1-a1", at: iso(0, 4), actor: "System", action: "Request received from AI Solutions form" },
    ],
    tags: ["turnitin", "rush"],
  },
  {
    id: "r2",
    ref: "SE-AIX-2038",
    type: "ai-removal",
    title: "Remove AI traces — marketing capstone",
    customer: { id: "c2", name: "Ethan Brooks", email: "ethan.brooks@mail.example", country: "USA" },
    subject: "Marketing",
    level: "Undergraduate",
    deadline: isoFuture(3),
    createdAt: iso(1, 2),
    updatedAt: iso(0, 5),
    status: "in-progress",
    priority: "high",
    assignedTo: "Priya Raghunathan",
    budget: 80,
    wordCount: 4200,
    aiScore: 76,
    plagScore: 9,
    details: "GPTZero flags 76% AI. Need human-voice rewrite that keeps my argument structure.",
    quotes: [
      {
        id: "q1",
        amount: 78,
        currency: "USD",
        note: "Full rewrite pass + post-edit AI report included.",
        status: "accepted",
        sentAt: iso(1),
        expiresAt: isoFuture(2),
      },
    ],
    attachments: [{ id: "f2", name: "capstone-v2.docx", size: "310 KB", kind: "DOCX" }],
    messages: [
      msg("m2", "customer", "Ethan Brooks", "Deadline is Monday 9am EST.", iso(1, 2)),
      msg("m3", "admin", "Priya Raghunathan", "Quote sent — rewrite begins on acceptance.", iso(1)),
      msg("m4", "customer", "Ethan Brooks", "Paid. Please go ahead.", iso(0, 20)),
    ],
    activity: baseActivity("r2"),
    tags: ["rewrite"],
  },
  {
    id: "r3",
    ref: "SE-CLS-1987",
    type: "class",
    title: "Full semester — BIO 210 Human Anatomy",
    customer: { id: "c3", name: "Maria Lopez", email: "maria.lopez@mail.example", country: "Spain" },
    subject: "Biology",
    level: "Undergraduate",
    deadline: isoFuture(84),
    createdAt: iso(4),
    updatedAt: iso(1),
    status: "quoted",
    priority: "normal",
    assignedTo: "Daniel Whitmore",
    budget: 1200,
    platform: "Canvas",
    details:
      "16-week class: weekly discussions, 4 quizzes, 2 lab reports and a final exam. Needs B+ or better.",
    quotes: [
      {
        id: "q2",
        amount: 1150,
        currency: "USD",
        note: "Milestone billing: 40% upfront, 30% mid-term, 30% before finals.",
        status: "sent",
        sentAt: iso(1),
        expiresAt: isoFuture(4),
      },
    ],
    attachments: [{ id: "f3", name: "bio210-syllabus.pdf", size: "1.2 MB", kind: "PDF" }],
    messages: [
      msg("m5", "customer", "Maria Lopez", "Here is the syllabus and grading rubric.", iso(4)),
      msg("m6", "admin", "Daniel Whitmore", "Quote issued with milestone billing.", iso(1)),
    ],
    activity: baseActivity("r3"),
    tags: ["semester", "canvas"],
  },
  {
    id: "r4",
    ref: "SE-ASG-2015",
    type: "assignment",
    title: "Corporate finance case study — 2,500 words",
    customer: { id: "c4", name: "Kwame Mensah", email: "kwame.m@mail.example", country: "Ghana" },
    subject: "Finance",
    level: "Graduate",
    deadline: isoFuture(2),
    createdAt: iso(2),
    updatedAt: iso(0, 8),
    status: "awaiting-payment",
    priority: "high",
    assignedTo: "Marcus Feldman",
    budget: 210,
    wordCount: 2500,
    details: "Harvard referencing, WACC and NPV analysis on the attached case pack.",
    quotes: [
      {
        id: "q3",
        amount: 195,
        currency: "USD",
        note: "48-hour turnaround, two free revisions.",
        status: "sent",
        sentAt: iso(0, 10),
        expiresAt: isoFuture(1),
      },
    ],
    attachments: [{ id: "f4", name: "case-pack.pdf", size: "780 KB", kind: "PDF" }],
    messages: [msg("m7", "customer", "Kwame Mensah", "Can you do it in 48 hours?", iso(2))],
    activity: baseActivity("r4"),
    tags: ["harvard"],
  },
  {
    id: "r5",
    ref: "SE-EXM-2044",
    type: "exam",
    title: "Proctored NCLEX-RN sitting — expert support",
    customer: { id: "c5", name: "Chloe Bennett", email: "chloe.b@mail.example", country: "UK" },
    subject: "Nursing",
    level: "Professional",
    deadline: isoFuture(5),
    createdAt: iso(0, 9),
    updatedAt: iso(0, 2),
    status: "reviewing",
    priority: "urgent",
    assignedTo: "Amara Okafor",
    budget: 600,
    platform: "Pearson VUE",
    details: "Remote-proctored, 4-hour window on Saturday. Wants expert-assisted option.",
    quotes: [],
    attachments: [],
    messages: [
      msg("m8", "customer", "Chloe Bennett", "Is the desktop app detectable on Pearson VUE?", iso(0, 9)),
    ],
    activity: [
      { id: "r5-a1", at: iso(0, 9), actor: "System", action: "Request received from Exam & Interview form" },
    ],
    tags: ["proctored", "examstealth"],
  },
  {
    id: "r6",
    ref: "SE-INT-2033",
    type: "interview",
    title: "Senior PM interview — live support (3 rounds)",
    customer: { id: "c6", name: "Rahul Verma", email: "rahul.v@mail.example", country: "India" },
    subject: "Product Management",
    level: "Professional",
    deadline: isoFuture(9),
    createdAt: iso(3),
    updatedAt: iso(1, 3),
    status: "in-progress",
    priority: "normal",
    assignedTo: "Grace Lim",
    budget: 450,
    platform: "Zoom",
    details: "Three rounds: behavioural, product sense, analytics. Needs discreet live prompting.",
    quotes: [
      {
        id: "q4",
        amount: 430,
        currency: "USD",
        note: "Per-round pricing, includes 1-hour prep call.",
        status: "accepted",
        sentAt: iso(2),
        expiresAt: isoFuture(1),
      },
    ],
    attachments: [{ id: "f5", name: "job-description.pdf", size: "220 KB", kind: "PDF" }],
    messages: [
      msg("m9", "customer", "Rahul Verma", "Round 1 is next Tuesday 4pm IST.", iso(3)),
      msg("m10", "expert", "Grace Lim", "Prep call booked for Sunday.", iso(1, 3)),
    ],
    activity: baseActivity("r6"),
    tags: ["live-support"],
  },
  {
    id: "r7",
    ref: "SE-ASG-1990",
    type: "assignment",
    title: "Python data-analysis notebook",
    customer: { id: "c7", name: "Ana Petrova", email: "ana.p@mail.example", country: "Bulgaria" },
    subject: "Computer Science",
    level: "Undergraduate",
    deadline: iso(1),
    createdAt: iso(9),
    updatedAt: iso(1),
    status: "delivered",
    priority: "normal",
    assignedTo: "Sofia Marchetti",
    budget: 160,
    details: "Pandas cleaning, three visualisations and a short write-up.",
    quotes: [
      {
        id: "q5",
        amount: 150,
        currency: "USD",
        note: "Includes commented notebook.",
        status: "accepted",
        sentAt: iso(8),
        expiresAt: iso(4),
      },
    ],
    attachments: [{ id: "f6", name: "dataset.csv", size: "3.4 MB", kind: "CSV" }],
    messages: [msg("m11", "admin", "Sofia Marchetti", "Delivered notebook + summary.", iso(1))],
    activity: baseActivity("r7"),
    tags: ["python"],
  },
  {
    id: "r8",
    ref: "SE-CLS-1954",
    type: "class",
    title: "Managerial accounting — 8-week accelerated",
    customer: { id: "c8", name: "James Oduya", email: "james.o@mail.example", country: "Kenya" },
    subject: "Accounting",
    level: "Graduate",
    deadline: iso(6),
    createdAt: iso(40),
    updatedAt: iso(6),
    status: "completed",
    priority: "low",
    assignedTo: "Marcus Feldman",
    budget: 900,
    platform: "Blackboard",
    details: "Completed with an A- final grade.",
    quotes: [
      {
        id: "q6",
        amount: 880,
        currency: "USD",
        note: "Two-instalment plan.",
        status: "accepted",
        sentAt: iso(38),
        expiresAt: iso(30),
      },
    ],
    attachments: [],
    messages: [msg("m12", "customer", "James Oduya", "Final grade A-. Thank you!", iso(6))],
    activity: baseActivity("r8"),
    tags: ["blackboard"],
  },
  {
    id: "r9",
    ref: "SE-AIR-1975",
    type: "ai-report",
    title: "Thesis full-document similarity report",
    customer: { id: "c9", name: "Lena Fischer", email: "lena.f@mail.example", country: "Germany" },
    subject: "Sociology",
    level: "Graduate",
    deadline: iso(2),
    createdAt: iso(12),
    updatedAt: iso(2),
    status: "revision",
    priority: "high",
    assignedTo: "Priya Raghunathan",
    budget: 60,
    wordCount: 18500,
    aiScore: 14,
    plagScore: 27,
    details: "Similarity at 27% — requesting a second pass excluding bibliography.",
    quotes: [
      {
        id: "q7",
        amount: 55,
        currency: "USD",
        note: "Includes one re-scan.",
        status: "accepted",
        sentAt: iso(11),
        expiresAt: iso(6),
      },
    ],
    attachments: [{ id: "f7", name: "thesis-final.pdf", size: "5.1 MB", kind: "PDF" }],
    messages: [msg("m13", "customer", "Lena Fischer", "Please exclude references.", iso(2))],
    activity: baseActivity("r9"),
    tags: ["re-scan"],
  },
  {
    id: "r10",
    ref: "SE-EXM-1902",
    type: "exam",
    title: "AWS SAA-C03 — self-serve ExamStealth licence",
    customer: { id: "c10", name: "Yusuf Karim", email: "yusuf.k@mail.example", country: "Malaysia" },
    subject: "Cloud Computing",
    level: "Professional",
    deadline: iso(14),
    createdAt: iso(22),
    updatedAt: iso(14),
    status: "cancelled",
    priority: "low",
    assignedTo: "Amara Okafor",
    budget: 250,
    platform: "PSI",
    details: "Customer rescheduled the exam and cancelled before payment.",
    quotes: [
      {
        id: "q8",
        amount: 240,
        currency: "USD",
        note: "Single-exam licence + setup call.",
        status: "expired",
        sentAt: iso(21),
        expiresAt: iso(16),
      },
    ],
    attachments: [],
    messages: [msg("m14", "customer", "Yusuf Karim", "Rescheduled — cancelling for now.", iso(14))],
    activity: baseActivity("r10"),
    tags: [],
  },
  {
    id: "r11",
    ref: "SE-AIX-2050",
    type: "ai-removal",
    title: "Humanise AI-generated literature review",
    customer: { id: "c11", name: "Sara Nilsson", email: "sara.n@mail.example", country: "Sweden" },
    subject: "Psychology",
    level: "Graduate",
    deadline: isoFuture(4),
    createdAt: iso(0, 2),
    updatedAt: iso(0, 2),
    status: "new",
    priority: "normal",
    assignedTo: null,
    budget: 120,
    wordCount: 5200,
    aiScore: 91,
    plagScore: 4,
    details: "Turnitin AI flag at 91%. Needs a full humanisation pass with citations intact.",
    quotes: [],
    attachments: [{ id: "f8", name: "lit-review.docx", size: "260 KB", kind: "DOCX" }],
    messages: [],
    activity: [
      { id: "r11-a1", at: iso(0, 2), actor: "System", action: "Request received from AI Solutions form" },
    ],
    tags: ["humanise"],
  },
  {
    id: "r12",
    ref: "SE-INT-1966",
    type: "interview",
    title: "Nursing panel interview coaching",
    customer: { id: "c12", name: "Tom Ferreira", email: "tom.f@mail.example", country: "Brazil" },
    subject: "Nursing",
    level: "Professional",
    deadline: iso(3),
    createdAt: iso(16),
    updatedAt: iso(3),
    status: "refunded",
    priority: "normal",
    assignedTo: "Grace Lim",
    budget: 180,
    platform: "Teams",
    details: "Expert unavailable at the rescheduled slot — full refund issued.",
    quotes: [
      {
        id: "q9",
        amount: 175,
        currency: "USD",
        note: "Two mock rounds.",
        status: "accepted",
        sentAt: iso(15),
        expiresAt: iso(10),
      },
    ],
    attachments: [],
    messages: [msg("m15", "admin", "Amara Okafor", "Refund processed to original card.", iso(3))],
    activity: baseActivity("r12"),
    tags: ["refund"],
  },
];

export const materialRecords: MaterialRecord[] = [
  { id: "m1", title: "NCLEX-RN 2026 Master Question Bank", exam: "NCLEX-RN", subject: "Nursing", level: "Professional", price: 34, status: "published", pages: 412, format: "PDF + Practice Bank", downloads: 5820, revenue: 197880, rating: 4.9, author: "Dr. Helen Mwangi", updatedAt: iso(3) },
  { id: "m2", title: "ATI TEAS 7 Complete Study Pack", exam: "ATI TEAS", subject: "Nursing", level: "Undergraduate", price: 24, status: "published", pages: 268, format: "PDF Bundle", downloads: 3410, revenue: 81840, rating: 4.8, author: "Dr. Helen Mwangi", updatedAt: iso(9) },
  { id: "m3", title: "HESI A2 Anatomy & Physiology Review", exam: "HESI A2", subject: "Biology", level: "Undergraduate", price: 18, status: "published", pages: 142, format: "PDF", downloads: 2190, revenue: 39420, rating: 4.7, author: "Sofia Marchetti", updatedAt: iso(14) },
  { id: "m4", title: "CPA FAR Concept Notes & Simulations", exam: "CPA", subject: "Accounting", level: "Professional", price: 39, status: "in-review", pages: 320, format: "PDF + Excel", downloads: 1780, revenue: 69420, rating: 4.8, author: "Marcus Feldman", updatedAt: iso(1) },
  { id: "m5", title: "CFA Level I Formula Vault", exam: "CFA Level I", subject: "Finance", level: "Professional", price: 21, status: "published", pages: 96, format: "PDF", downloads: 4260, revenue: 89460, rating: 4.9, author: "Marcus Feldman", updatedAt: iso(6) },
  { id: "m6", title: "PMP Exam Prep: Agile & Predictive Playbook", exam: "PMP", subject: "Project Management", level: "Professional", price: 29, status: "published", pages: 210, format: "PDF + Flashcards", downloads: 1520, revenue: 44080, rating: 4.7, author: "Daniel Whitmore", updatedAt: iso(21) },
  { id: "m7", title: "GRE Quantitative Reasoning Drill Book", exam: "GRE", subject: "Mathematics", level: "Graduate", price: 19, status: "published", pages: 188, format: "PDF", downloads: 2960, revenue: 56240, rating: 4.6, author: "Sofia Marchetti", updatedAt: iso(11) },
  { id: "m8", title: "SAT Reading & Writing Strategy Guide", exam: "SAT", subject: "English & Writing", level: "High School", price: 15, status: "draft", pages: 154, format: "PDF", downloads: 0, revenue: 0, rating: 0, author: "Priya Raghunathan", updatedAt: iso(0, 5) },
  { id: "m9", title: "AWS Solutions Architect Associate Lab Notes", exam: "AWS Solutions Architect", subject: "Cloud Computing", level: "Professional", price: 27, status: "published", pages: 176, format: "PDF + Diagrams", downloads: 2040, revenue: 55080, rating: 4.8, author: "Tunde Balogun", updatedAt: iso(4) },
  { id: "m10", title: "USMLE Step 1 Pharmacology High-Yield Tables", exam: "USMLE Step 1", subject: "Pharmacology", level: "Graduate", price: 31, status: "published", pages: 132, format: "PDF", downloads: 3320, revenue: 102920, rating: 4.9, author: "Dr. Helen Mwangi", updatedAt: iso(8) },
  { id: "m11", title: "NCLEX-RN Pharmacology Mnemonics Pack", exam: "NCLEX-RN", subject: "Pharmacology", level: "Professional", price: 14, status: "archived", pages: 88, format: "PDF + Flashcards", downloads: 2510, revenue: 35140, rating: 4.6, author: "Dr. Helen Mwangi", updatedAt: iso(60) },
  { id: "m12", title: "CFA Level I Ethics Case Compendium", exam: "CFA Level I", subject: "Finance", level: "Professional", price: 17, status: "published", pages: 118, format: "PDF", downloads: 1340, revenue: 22780, rating: 4.7, author: "Marcus Feldman", updatedAt: iso(17) },
];

export const orders: Order[] = [
  { id: "o1", ref: "ORD-90412", materialTitle: "NCLEX-RN 2026 Master Question Bank", customer: { name: "Nadia Hassan", email: "nadia.hassan@mail.example" }, amount: 34, gateway: "Stripe", status: "paid", createdAt: iso(0, 3) },
  { id: "o2", ref: "ORD-90411", materialTitle: "CFA Level I Formula Vault", customer: { name: "Rahul Verma", email: "rahul.v@mail.example" }, amount: 21, gateway: "PayPal", status: "paid", createdAt: iso(0, 7) },
  { id: "o3", ref: "ORD-90408", materialTitle: "CPA FAR Concept Notes & Simulations", customer: { name: "James Oduya", email: "james.o@mail.example" }, amount: 39, gateway: "Wise", status: "pending", createdAt: iso(1) },
  { id: "o4", ref: "ORD-90402", materialTitle: "GRE Quantitative Reasoning Drill Book", customer: { name: "Ana Petrova", email: "ana.p@mail.example" }, amount: 19, gateway: "Stripe", status: "refunded", createdAt: iso(3) },
  { id: "o5", ref: "ORD-90399", materialTitle: "USMLE Step 1 Pharmacology High-Yield Tables", customer: { name: "Lena Fischer", email: "lena.f@mail.example" }, amount: 31, gateway: "Stripe", status: "paid", createdAt: iso(4) },
  { id: "o6", ref: "ORD-90390", materialTitle: "ATI TEAS 7 Complete Study Pack", customer: { name: "Chloe Bennett", email: "chloe.b@mail.example" }, amount: 24, gateway: "Bank Transfer", status: "failed", createdAt: iso(6) },
  { id: "o7", ref: "ORD-90385", materialTitle: "AWS Solutions Architect Associate Lab Notes", customer: { name: "Yusuf Karim", email: "yusuf.k@mail.example" }, amount: 27, gateway: "Stripe", status: "disputed", createdAt: iso(8) },
  { id: "o8", ref: "ORD-90380", materialTitle: "PMP Exam Prep: Agile & Predictive Playbook", customer: { name: "Kwame Mensah", email: "kwame.m@mail.example" }, amount: 29, gateway: "PayPal", status: "paid", createdAt: iso(9) },
  { id: "o9", ref: "ORD-90372", materialTitle: "SAT Reading & Writing Strategy Guide", customer: { name: "Ethan Brooks", email: "ethan.brooks@mail.example" }, amount: 15, gateway: "Stripe", status: "paid", createdAt: iso(12) },
  { id: "o10", ref: "ORD-90366", materialTitle: "HESI A2 Anatomy & Physiology Review", customer: { name: "Maria Lopez", email: "maria.lopez@mail.example" }, amount: 18, gateway: "Stripe", status: "paid", createdAt: iso(15) },
];

export const customers: Customer[] = [
  { id: "c1", name: "Nadia Hassan", email: "nadia.hassan@mail.example", country: "UAE", joinedAt: iso(120), requests: 5, orders: 3, spend: 412, status: "active", lastActive: iso(0, 1) },
  { id: "c2", name: "Ethan Brooks", email: "ethan.brooks@mail.example", country: "USA", joinedAt: iso(240), requests: 8, orders: 6, spend: 1180, status: "active", lastActive: iso(0, 6) },
  { id: "c3", name: "Maria Lopez", email: "maria.lopez@mail.example", country: "Spain", joinedAt: iso(60), requests: 2, orders: 1, spend: 168, status: "active", lastActive: iso(1) },
  { id: "c4", name: "Kwame Mensah", email: "kwame.m@mail.example", country: "Ghana", joinedAt: iso(30), requests: 3, orders: 2, spend: 254, status: "pending", lastActive: iso(0, 12) },
  { id: "c5", name: "Chloe Bennett", email: "chloe.b@mail.example", country: "UK", joinedAt: iso(15), requests: 1, orders: 0, spend: 0, status: "active", lastActive: iso(0, 9) },
  { id: "c6", name: "Rahul Verma", email: "rahul.v@mail.example", country: "India", joinedAt: iso(400), requests: 12, orders: 9, spend: 2840, status: "active", lastActive: iso(0, 3) },
  { id: "c7", name: "Ana Petrova", email: "ana.p@mail.example", country: "Bulgaria", joinedAt: iso(200), requests: 4, orders: 4, spend: 620, status: "active", lastActive: iso(2) },
  { id: "c8", name: "James Oduya", email: "james.o@mail.example", country: "Kenya", joinedAt: iso(320), requests: 6, orders: 3, spend: 1420, status: "active", lastActive: iso(6) },
  { id: "c9", name: "Lena Fischer", email: "lena.f@mail.example", country: "Germany", joinedAt: iso(90), requests: 3, orders: 2, spend: 340, status: "suspended", lastActive: iso(2) },
  { id: "c10", name: "Yusuf Karim", email: "yusuf.k@mail.example", country: "Malaysia", joinedAt: iso(52), requests: 2, orders: 1, spend: 27, status: "banned", lastActive: iso(14) },
  { id: "c11", name: "Sara Nilsson", email: "sara.n@mail.example", country: "Sweden", joinedAt: iso(7), requests: 1, orders: 0, spend: 0, status: "pending", lastActive: iso(0, 2) },
  { id: "c12", name: "Tom Ferreira", email: "tom.f@mail.example", country: "Brazil", joinedAt: iso(170), requests: 4, orders: 2, spend: 510, status: "active", lastActive: iso(3) },
];

export const licenses: License[] = [
  { id: "l1", key: "STLH-9F2K-77QA-1MBD", customer: "Rahul Verma", email: "rahul.v@mail.example", plan: "Semester", devices: 2, maxDevices: 3, status: "active", issuedAt: iso(30), expiresAt: isoFuture(90), lastSeen: iso(0, 2), os: "Windows" },
  { id: "l2", key: "STLH-4B8T-02XN-9PLC", customer: "Chloe Bennett", email: "chloe.b@mail.example", plan: "Single Exam", devices: 1, maxDevices: 1, status: "pending", issuedAt: iso(0, 6), expiresAt: isoFuture(14), lastSeen: iso(0, 6), os: "macOS" },
  { id: "l3", key: "STLH-1CD5-56RE-8KLM", customer: "Yusuf Karim", email: "yusuf.k@mail.example", plan: "Single Exam", devices: 1, maxDevices: 1, status: "revoked", issuedAt: iso(22), expiresAt: iso(8), lastSeen: iso(15), os: "Windows" },
  { id: "l4", key: "STLH-7YH2-33WQ-6TRV", customer: "Ethan Brooks", email: "ethan.brooks@mail.example", plan: "Trial", devices: 1, maxDevices: 1, status: "expired", issuedAt: iso(45), expiresAt: iso(38), lastSeen: iso(38), os: "Windows" },
  { id: "l5", key: "STLH-5MN9-88ZA-2QWE", customer: "Ridgeway Academy", email: "ops@ridgeway.example", plan: "Enterprise", devices: 24, maxDevices: 50, status: "active", issuedAt: iso(150), expiresAt: isoFuture(215), lastSeen: iso(0, 1), os: "Windows" },
  { id: "l6", key: "STLH-3JK7-19PL-4ZXC", customer: "Ana Petrova", email: "ana.p@mail.example", plan: "Semester", devices: 3, maxDevices: 3, status: "active", issuedAt: iso(70), expiresAt: isoFuture(20), lastSeen: iso(2), os: "macOS" },
];

export const payouts: Payout[] = [
  { id: "p1", expert: "Dr. Helen Mwangi", period: "Jul 1 – Jul 15", jobs: 12, amount: 1840, method: "Wise", status: "scheduled", dueAt: isoFuture(2) },
  { id: "p2", expert: "Marcus Feldman", period: "Jul 1 – Jul 15", jobs: 9, amount: 2260, method: "Bank Transfer", status: "processing", dueAt: isoFuture(1) },
  { id: "p3", expert: "Sofia Marchetti", period: "Jul 1 – Jul 15", jobs: 15, amount: 980, method: "PayPal", status: "paid", dueAt: iso(2) },
  { id: "p4", expert: "Tunde Balogun", period: "Jul 1 – Jul 15", jobs: 3, amount: 420, method: "Wise", status: "on-hold", dueAt: isoFuture(4) },
  { id: "p5", expert: "Grace Lim", period: "Jun 16 – Jun 30", jobs: 7, amount: 1310, method: "PayPal", status: "paid", dueAt: iso(20) },
];

export const revenueSeries = [
  { month: "Feb", materials: 12400, services: 28600, stealth: 8200 },
  { month: "Mar", materials: 14100, services: 31200, stealth: 9600 },
  { month: "Apr", materials: 15900, services: 35800, stealth: 12400 },
  { month: "May", materials: 17300, services: 39100, stealth: 14800 },
  { month: "Jun", materials: 18800, services: 44200, stealth: 17600 },
  { month: "Jul", materials: 21200, services: 49800, stealth: 21300 },
];

export const requestVolumeSeries = [
  { day: "Mon", requests: 34, quoted: 22, converted: 15 },
  { day: "Tue", requests: 41, quoted: 28, converted: 19 },
  { day: "Wed", requests: 38, quoted: 25, converted: 18 },
  { day: "Thu", requests: 52, quoted: 36, converted: 24 },
  { day: "Fri", requests: 47, quoted: 31, converted: 21 },
  { day: "Sat", requests: 29, quoted: 18, converted: 12 },
  { day: "Sun", requests: 23, quoted: 14, converted: 9 },
];

export const requestTypeLabels: Record<RequestType, string> = {
  "ai-report": "AI & Plagiarism Report",
  "ai-removal": "AI & Plagiarism Removal",
  class: "Class Help",
  assignment: "Assignment Help",
  exam: "Exam Help",
  interview: "Interview Help",
};

export const requestStatuses: RequestStatus[] = [
  "new",
  "reviewing",
  "quoted",
  "awaiting-payment",
  "in-progress",
  "delivered",
  "revision",
  "completed",
  "cancelled",
  "refunded",
];

export const priorities: Priority[] = ["low", "normal", "high", "urgent"];
