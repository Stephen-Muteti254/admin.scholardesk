import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Paperclip, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, formatDate } from "@/components/admin/AdminUI";
import {
  listSubmissions,
  releaseSubmission,
  submissionFileUrl,
  type Order,
  type OrderSubmission,
} from "@/services/orderService";

function SubmissionCard({
  order,
  submission,
  onReleased,
}: {
  order: Order;
  submission: OrderSubmission;
  onReleased: (updated: OrderSubmission) => void;
}) {
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const release = useMutation({
    mutationFn: () => releaseSubmission(order.id, submission.id, { note: note || undefined, files }),
    onSuccess: (updated) => {
      toast.success("Released to customer");
      onReleased(updated);
    },
    onError: () => toast.error("Unable to release this submission"),
  });

  const isPending = submission.status === "pending_review";

  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Version {submission.version}</p>
        <StatusBadge value={submission.status} />
      </div>

      {submission.summary && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{submission.summary}</p>
      )}

      {submission.files.length > 0 && (
        <ul className="space-y-1">
          {submission.files.map((file) => (
            <li key={file.id}>
              <a
                href={submissionFileUrl(order.id, file.url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary underline underline-offset-2"
              >
                <Download className="h-3.5 w-3.5" />
                {file.name}
                {file.added_by === "support" && (
                  <span className="text-xs text-muted-foreground">(added by support)</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}

      {isPending && (
        <div className="space-y-2 rounded-lg bg-muted/40 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Awaiting integrity review - release to send this to the customer
          </p>
          <Textarea
            rows={2}
            placeholder="Optional note to include (e.g. integrity check summary)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <Paperclip className="h-4 w-4" />
              {files.length > 0 ? `${files.length} file(s) attached` : "Attach files"}
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
            </label>
            <Button
              size="sm"
              className="ml-auto"
              disabled={release.isPending}
              onClick={() => release.mutate()}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {release.isPending ? "Releasing…" : "Release to customer"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SubmissionsDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [submissions, setSubmissions] = useState<OrderSubmission[]>([]);

  const query = useQuery({
    queryKey: ["order-submissions", order?.id],
    queryFn: () => listSubmissions(order!.id),
    enabled: open && Boolean(order),
  });

  useEffect(() => {
    if (query.data) setSubmissions(query.data);
  }, [query.data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submissions</DialogTitle>
          <DialogDescription>
            {order ? `Order ${order.ref} - ${order.materialTitle}` : ""}
          </DialogDescription>
        </DialogHeader>

        {query.isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : submissions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No work has been delivered yet for this order.
          </p>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                order={order!}
                submission={submission}
                onReleased={(updated) => {
                  setSubmissions((prev) =>
                    prev.map((s) => (s.id === updated.id ? updated : s)),
                  );
                  void queryClient.invalidateQueries({ queryKey: ["orders"] });
                }}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
