import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatRoleName, MILESTONE_LABELS } from "@/lib/case-format";
import type { CaseParticipant, CaseTimeline } from "@/types";
import { Detail } from "./Detail";

interface CaseSidebarProps {
  timeline?: CaseTimeline;
}

/** "Rishabh Verma (Site Engineer)" — falls back to just the name if the role isn't known. */
function participantLabel(person?: CaseParticipant | null): string | undefined {
  if (!person) return undefined;
  const role = formatRoleName(person.role?.name);
  return role ? `${person.name} (${role})` : person.name;
}

export function CaseSidebar({ timeline }: CaseSidebarProps) {
  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">People</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Detail
            label="Created by"
            value={participantLabel(timeline?.participants?.createdBy)}
          />
          <Detail
            label="Site engineer"
            value={participantLabel(timeline?.participants?.assignedTo)}
          />
          <Detail
            label="Checker"
            value={participantLabel(timeline?.participants?.checkedBy)}
          />
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
