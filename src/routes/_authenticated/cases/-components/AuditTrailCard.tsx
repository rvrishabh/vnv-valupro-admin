import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CASE_ACTION_LABELS, formatDateTime } from "@/lib/case-format";
import type { CaseTimeline } from "@/types";

interface AuditTrailCardProps {
  timeline?: CaseTimeline;
}

export function AuditTrailCard({ timeline }: AuditTrailCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        {timeline?.events?.length ? (
          <ol className="flex flex-col gap-3">
            {timeline.events.map((event) => (
              <li key={event.id} className="flex gap-3 text-sm">
                <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {CASE_ACTION_LABELS[event.action] ?? event.action}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(event.createdAt)} · {event.actor?.name}
                    {event.oldStatus
                      ? ` · ${event.oldStatus} → ${event.newStatus}`
                      : ` · ${event.newStatus ?? ""}`}
                  </span>
                  {event.notes ? (
                    <span className="mt-0.5 text-xs italic text-muted-foreground">
                      “{event.notes}”
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">No events recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
