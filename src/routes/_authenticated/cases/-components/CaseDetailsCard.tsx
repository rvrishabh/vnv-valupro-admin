import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Case } from "@/types";
import { Detail } from "./Detail";

interface CaseDetailsCardProps {
  record: Case;
}

export function CaseDetailsCard({ record }: CaseDetailsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Case Details</CardTitle>
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
    </Card>
  );
}
