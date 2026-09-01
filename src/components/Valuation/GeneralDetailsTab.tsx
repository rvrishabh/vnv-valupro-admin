import { FormTextArea } from "@/components/Form/FormTextArea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { CheckerReviewCard } from "@/components/Valuation/CheckerReviewCard";
import {
  APPROVAL_FIELDS,
  DEVELOPMENT_FIELDS,
  FACILITIES_FIELDS,
  FLOOR_DETAIL_FIELDS,
  LOCATION_FIELDS,
  OCCUPANCY_FIELDS,
  ROOM_FIELDS,
} from "@/components/Valuation/field-groups";
import { SectionFields } from "@/components/Valuation/SectionFields";
import type { FormState } from "@/components/Valuation/valuation-form.utils";
import type { Valuation, ValuationOptions } from "@/types";
import type { Control, UseFormReturn } from "react-hook-form";

export function GeneralDetailsTab({
  control,
  options,
  disabled,
  roomsSummary,
  valuation,
  reviewForm,
  onApproveReview,
  onRejectReview,
  isReviewPending,
}: {
  control: Control<FormState>;
  options?: ValuationOptions;
  disabled: boolean;
  roomsSummary: string | null;
  valuation: Valuation;
  reviewForm: UseFormReturn<{ notes: string }>;
  onApproveReview: () => void;
  onRejectReview: () => void;
  isReviewPending: boolean;
}) {
  return (
    <TabsContent value="general" className="mt-4 flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Approval Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionFields
            control={control}
            section="generalDetails"
            fields={APPROVAL_FIELDS}
            options={options}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Occupancy &amp; Tenancy Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionFields
            control={control}
            section="generalDetails"
            fields={OCCUPANCY_FIELDS}
            options={options}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Location Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionFields
            control={control}
            section="generalDetails"
            fields={LOCATION_FIELDS}
            options={options}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Development &amp; Factors Affecting Land Rates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionFields
            control={control}
            section="generalDetails"
            fields={DEVELOPMENT_FIELDS}
            options={options}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Miscellaneous Facilities <span className="font-normal text-muted-foreground">(flats &amp; multi-storey)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionFields
            control={control}
            section="generalDetails"
            fields={FACILITIES_FIELDS}
            options={options}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">No. of Rooms</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <SectionFields
            control={control}
            section="rooms"
            fields={ROOM_FIELDS}
            options={options}
            disabled={disabled}
          />
          {roomsSummary ? (
            <p className="text-xs text-muted-foreground sm:col-span-4">{roomsSummary}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Floor Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionFields
            control={control}
            section="floorDetails"
            fields={FLOOR_DETAIL_FIELDS}
            options={options}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Brief Description of Property based on Site Visit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormTextArea
            control={control}
            name="briefDescription"
            rows={3}
            placeholder="This is a two storey residential house with good quality construction."
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          <FormTextArea control={control} name="engineerNotes" rows={4} disabled={disabled} />
        </CardContent>
      </Card>

      {valuation.status === "SUBMITTED" ? (
        <CheckerReviewCard
          reviewForm={reviewForm}
          onApprove={onApproveReview}
          onReject={onRejectReview}
          isPending={isReviewPending}
        />
      ) : null}

      {valuation.checkerNotes ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Checker Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{valuation.checkerNotes}</CardContent>
        </Card>
      ) : null}
    </TabsContent>
  );
}
