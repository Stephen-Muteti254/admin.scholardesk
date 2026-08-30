import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  Download,
  FileText,
  Paperclip,
  Send,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusBadge, formatDateTime, formatMoney, relativeTime } from "./AdminUI";
import {
  admins,
  experts,
  priorities,
  requestStatuses,
  requestTypeLabels,
  type Quote,
  type RequestStatus,
  type ServiceRequest,
} from "@/data/admin/mock";
import {
  deleteRequest,
  refundRequest,
  replyToRequest,
  sendQuote,
  updateQuote,
  updateRequest,
  withdrawQuote,
} from "@/services/adminService";

type Props = {
  request: ServiceRequest | null;
  onClose: () => void;
  onChange: (id: string, patch: Partial<ServiceRequest>) => void;
  onDelete: (id: string) => void;
};

export function RequestWorkspace({ request, onClose, onChange, onDelete }: Props) {
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [amount, setAmount] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [quoteExpiry, setQuoteExpiry] = useState("");

  if (!request) return null;
  const r = request;

  const patch = (p: Partial<ServiceRequest>, message: string) => {
    onChange(r.id, { ...p, updatedAt: new Date().toISOString() });
    void updateRequest(r.id, p as Record<string, unknown>).catch(() => {});
    toast.success(message);
  };

  const submitReply = () => {
    if (!reply.trim()) return;
    const form = new FormData();
    form.append("body", reply);
    form.append("internal", String(internal));
    void replyToRequest(r.id, form).catch(() => {});
    onChange(r.id, {
      messages: [
        ...r.messages,
        {
          id: `m-${Date.now()}`,
          role: "admin",
          author: "Amara Okafor",
          body: internal ? `[Internal note] ${reply}` : reply,
          at: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    });
    setReply("");
    toast.success(internal ? "Internal note added" : "Reply sent to customer");
  };

  const addQuote = () => {
    const value = Number(amount);
    if (!value) {
      toast.error("Enter a quote amount");
      return;
    }
    const quote: Quote = {
      id: `q-${Date.now()}`,
      amount: value,
      currency: "USD",
      note: quoteNote || "Quote issued by operations.",
      status: "sent",
      sentAt: new Date().toISOString(),
      expiresAt: quoteExpiry || new Date(Date.now() + 3 * 864e5).toISOString(),
    };
    void sendQuote(r.id, quote as unknown as Record<string, unknown>).catch(() => {});
    onChange(r.id, { quotes: [...r.quotes, quote], status: "quoted" });
    setAmount("");
    setQuoteNote("");
    setQuoteExpiry("");
    toast.success(`Quote of ${formatMoney(value)} sent`);
  };

  const setQuoteStatus = (quoteId: string, status: Quote["status"]) => {
    void updateQuote(r.id, quoteId, { status }).catch(() => {});
    onChange(r.id, {
      quotes: r.quotes.map((q) => (q.id === quoteId ? { ...q, status } : q)),
    });
    toast.success(`Quote marked ${status}`);
  };

  const removeQuote = (quoteId: string) => {
    void withdrawQuote(r.id, quoteId).catch(() => {});
    onChange(r.id, { quotes: r.quotes.filter((q) => q.id !== quoteId) });
    toast.success("Quote withdrawn");
  };

  return (
    <Sheet open={!!request} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={r.status} />
            <StatusBadge value={r.priority} />
            <span className="text-xs font-medium text-muted-foreground">{r.ref}</span>
          </div>
          <SheetTitle className="text-left text-lg leading-snug">{r.title}</SheetTitle>
          <SheetDescription className="text-left">
            {requestTypeLabels[r.type]} · {r.customer.name} ({r.customer.email}) ·{" "}
            {r.customer.country}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-10">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Status">
              <Select
                value={r.status}
                onValueChange={(v) => patch({ status: v as RequestStatus }, `Status set to ${v}`)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {requestStatuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.replace(/-/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select
                value={r.priority}
                onValueChange={(v) =>
                  patch({ priority: v as ServiceRequest["priority"] }, `Priority set to ${v}`)
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Owner">
              <Select
                value={r.assignedTo ?? "Unassigned"}
                onValueChange={(v) =>
                  patch({ assignedTo: v === "Unassigned" ? null : v }, `Assigned to ${v}`)
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[...admins, ...experts.map((e) => e.name)].map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Tabs defaultValue="brief">
            <TabsList className="w-full">
              <TabsTrigger value="brief" className="flex-1">Brief</TabsTrigger>
              <TabsTrigger value="conversation" className="flex-1">
                Messages ({r.messages.length})
              </TabsTrigger>
              <TabsTrigger value="quotes" className="flex-1">Quotes ({r.quotes.length})</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="brief" className="space-y-4 pt-4">
              <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm">
                {r.details}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Meta label="Subject" value={r.subject} />
                <Meta label="Level" value={r.level} />
                <Meta label="Deadline" value={formatDateTime(r.deadline)} />
                <Meta label="Created" value={`${formatDateTime(r.createdAt)} (${relativeTime(r.createdAt)})`} />
                <Meta label="Budget" value={r.budget ? formatMoney(r.budget) : "Not provided"} />
                {r.wordCount && <Meta label="Word count" value={r.wordCount.toLocaleString()} />}
                {r.platform && <Meta label="Platform" value={r.platform} />}
                {r.aiScore !== undefined && <Meta label="AI detection" value={`${r.aiScore}%`} />}
                {r.plagScore !== undefined && <Meta label="Similarity" value={`${r.plagScore}%`} />}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Files ({r.attachments.length})
                </p>
                <div className="mt-2 space-y-2">
                  {r.attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
                    >
                      <FileText className="h-4 w-4 text-accent" />
                      <span className="flex-1 truncate">{a.name}</span>
                      <span className="text-xs text-muted-foreground">{a.size}</span>
                      <Button variant="ghost" size="icon" aria-label="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove file"
                        onClick={() =>
                          patch(
                            { attachments: r.attachments.filter((f) => f.id !== a.id) },
                            "Attachment removed",
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {r.attachments.length === 0 && (
                    <p className="text-sm text-muted-foreground">No files uploaded.</p>
                  )}
                  <Button variant="outline" size="sm" onClick={() => toast.success("Deliverable upload queued")}>
                    <Paperclip className="h-4 w-4" /> Upload deliverable
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="conversation" className="space-y-4 pt-4">
              <div className="space-y-3">
                {r.messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.role === "customer"
                        ? "rounded-lg border border-border bg-card p-3"
                        : "rounded-lg border border-accent/30 bg-accent/5 p-3"
                    }
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{m.author}</span>
                      <span>{formatDateTime(m.at)}</span>
                    </div>
                    <p className="mt-1.5 text-sm">{m.body}</p>
                  </div>
                ))}
                {r.messages.length === 0 && (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                )}
              </div>
              <Separator />
              <div className="space-y-3">
                <Textarea
                  rows={4}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a detailed response to the customer…"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={submitReply}>
                    <Send className="h-4 w-4" /> {internal ? "Save note" : "Send reply"}
                  </Button>
                  <Button variant="outline" onClick={() => setInternal((v) => !v)}>
                    {internal ? "Switch to customer reply" : "Switch to internal note"}
                  </Button>
                  <Button variant="ghost" onClick={() => toast.success("Attachment picker opened")}>
                    <Paperclip className="h-4 w-4" /> Attach
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quotes" className="space-y-4 pt-4">
              {r.quotes.map((q) => (
                <div key={q.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-lg font-semibold">
                      {formatMoney(q.amount)}
                    </span>
                    <StatusBadge value={q.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{q.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sent {formatDateTime(q.sentAt)} · Expires {formatDateTime(q.expiresAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setQuoteStatus(q.id, "accepted")}>
                      Mark accepted
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setQuoteStatus(q.id, "declined")}>
                      Mark declined
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success("Quote resent")}>
                      Resend
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeQuote(q.id)}>
                      Withdraw
                    </Button>
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-dashed border-border p-4">
                <p className="text-sm font-semibold">Issue another quote</p>
                <p className="text-xs text-muted-foreground">
                  Multiple quotes are supported — for milestones, revisions or add-ons.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field label="Amount (USD)">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="250"
                    />
                  </Field>
                  <Field label="Valid until">
                    <Input
                      type="date"
                      value={quoteExpiry.slice(0, 10)}
                      onChange={(e) => setQuoteExpiry(new Date(e.target.value).toISOString())}
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="Scope / terms">
                    <Textarea
                      rows={3}
                      value={quoteNote}
                      onChange={(e) => setQuoteNote(e.target.value)}
                      placeholder="What is included, milestones, revisions…"
                    />
                  </Field>
                </div>
                <Button className="mt-3" onClick={addQuote}>
                  <CalendarClock className="h-4 w-4" /> Send quote
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-3 pt-4">
              {r.activity.map((a) => (
                <div key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p>{a.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.actor} · {formatDateTime(a.at)}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => patch({ status: "in-progress" }, "Marked in progress")}
            >
              <UserCheck className="h-4 w-4" /> Start work
            </Button>
            <Button variant="outline" onClick={() => patch({ status: "delivered" }, "Marked delivered")}>
              Mark delivered
            </Button>
            <Button variant="outline" onClick={() => patch({ status: "completed" }, "Request completed")}>
              Complete
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => {
                void refundRequest(r.id, { reason: "admin-initiated" }).catch(() => {});
                patch({ status: "refunded" }, "Refund issued");
              }}
            >
              Refund
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {r.ref}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the request, its quotes, messages and files.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void deleteRequest(r.id).catch(() => {});
                      onDelete(r.id);
                      onClose();
                      toast.success(`${r.ref} deleted`);
                    }}
                  >
                    Delete request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
