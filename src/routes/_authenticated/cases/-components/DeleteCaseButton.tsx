import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";

interface DeleteCaseButtonProps {
  caseNumber: string;
  hasValuation: boolean;
  onConfirm: () => void;
  variant?: "icon" | "full";
}

/**
 * Deleting a case takes its valuation and audit trail with it, so the dialog
 * says so plainly rather than asking a generic "are you sure?".
 */
export function DeleteCaseButton({
  caseNumber,
  hasValuation,
  onConfirm,
  variant = "icon",
}: DeleteCaseButtonProps) {
  return (
    <AlertPopup
      trigger={
        variant === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Delete case ${caseNumber}`}
          >
            <IconTrash className="size-4" />
          </Button>
        ) : (
          <Button variant="outline" className="text-destructive">
            <IconTrash className="mr-1 size-4" />
            Delete
          </Button>
        )
      }
      title={`Delete case ${caseNumber}?`}
      cancelAction="Cancel"
      continueAction={<span onClick={onConfirm}>Delete case</span>}
    >
      This permanently deletes the case
      {hasValuation ? ", its valuation report" : ""}, along with any documents,
      fees, queries and the full audit trail. This cannot be undone.
    </AlertPopup>
  );
}
