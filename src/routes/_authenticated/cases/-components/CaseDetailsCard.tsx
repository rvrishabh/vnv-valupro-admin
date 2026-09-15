import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Case } from "@/types";
import { IconPencil } from "@tabler/icons-react";
import { useState } from "react";
import { Detail } from "./Detail";
import { EditCaseModal } from "./EditCaseModal";

interface CaseDetailsCardProps {
  record: Case;
}

export function CaseDetailsCard({ record }: CaseDetailsCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Case Details</CardTitle>
        {/* CardHeader lays its children out on a grid, not a flex row — a
            plain child in the second slot just drops to the row below the
            title. CardAction is the shadcn-provided slot that pins to the
            top-right instead. */}
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <IconPencil className="h-4 w-4" />
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Customer" value={record.customerName} />
        <Detail label="Contact" value={record.customerMobile} />
        <Detail label="Bank" value={record.institution?.name} />
        <Detail label="Branch" value={record.branch?.branchName} />
        <Detail label="Property type" value={record.propertyType} />
        <Detail label="Bank reference" value={record.bankReference} />
        <div className="sm:col-span-2">
          <Detail label="Property location" value={record.propertyLocation} />
        </div>
      </CardContent>

      <EditCaseModal open={editOpen} onOpenChange={setEditOpen} record={record} />
    </Card>
  );
}
