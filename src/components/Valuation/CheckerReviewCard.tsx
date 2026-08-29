import { FormTextArea } from "@/components/Form/FormTextArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";

export function CheckerReviewCard({
  reviewForm,
  onApprove,
  onReject,
  isPending,
}: {
  reviewForm: UseFormReturn<{ notes: string }>;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Checker Review</CardTitle>
      </CardHeader>
      {/* Its own provider: the review note is a separate form from
          the valuation being edited around it. */}
      <CardContent className="flex flex-col gap-3">
        <Form {...reviewForm}>
          <FormTextArea
            control={reviewForm.control}
            name="notes"
            rows={3}
            placeholder="Review notes"
          />
        </Form>
        <div className="flex gap-2">
          <Button type="button" onClick={onApprove} disabled={isPending}>
            Approve
          </Button>
          <Button type="button" variant="destructive" onClick={onReject} disabled={isPending}>
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
