import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, MILESTONE_LABELS } from "@/lib/case-format";
import type { CaseTimeline } from "@/types";
import { Detail } from "./Detail";

interface CaseSidebarProps {
  timeline?: CaseTimeline;
}

export function CaseSidebar({ timeline }: CaseSidebarProps) {
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">People</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Detail label="Created by" value={timeline?.participants?.createdBy?.name} />
          <Detail
            label="Site engineer"
            value={timeline?.participants?.assignedTo?.name}
          />
          <Detail label="Checker" value={timeline?.participants?.checkedBy?.name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Milestones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 text-sm">
          {MILESTONE_LABELS.map(([key, label]) => {
            const value = timeline?.milestones?.[
              key as keyof NonNullable<typeof timeline>["milestones"]
            ];
            return (
              <div
                key={key}
                className="flex items-baseline justify-between gap-3 border-b border-dashed py-1 last:border-none"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className={value ? "tabular-nums" : "text-muted-foreground"}>
                  {formatDateTime(value)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
