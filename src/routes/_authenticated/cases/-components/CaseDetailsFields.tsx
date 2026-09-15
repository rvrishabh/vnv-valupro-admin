import { usePublicBranchesQuery } from "@/api/queries/branches";
import { useInstitutionsQuery } from "@/api/queries/institutions";
import FormComboBox from "@/components/Form/FormComboBox";
import FormInput from "@/components/Form/FormInput";
import type { CreateCasePayload, PropertyType } from "@/types";
import type { Control } from "react-hook-form";

const PROPERTY_TYPES: PropertyType[] = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "LAND",
  "INDUSTRIAL",
];

/**
 * The case-details fields shared by the "New Case" form and the "Edit Case"
 * modal — same field names either way (create and update payloads share a
 * shape), so this only needs the form's `control` and the currently-picked
 * bank, to scope the branch options.
 */
export function CaseDetailsFields({
  control,
  institutionId,
}: {
  control: Control<CreateCasePayload>;
  institutionId: string;
}) {
  const institutionsQuery = useInstitutionsQuery({ page: 1, limit: 100 });
  // Only fetches once a bank is picked, and refetches for the new bank when
  // it changes — a branch belongs to exactly one institution.
  const branchesQuery = usePublicBranchesQuery(institutionId);

  return (
    <>
      <FormInput control={control} name="customerName" label="Customer / owner name" required />

      <FormInput control={control} name="customerMobile" label="Contact mobile" required />

      <FormComboBox
        control={control}
        name="institutionId"
        label="Bank"
        placeholder="Select bank"
        required
        options={(institutionsQuery.data?.data ?? []).map((institution) => ({
          label: institution.name,
          value: institution.id,
        }))}
      />

      <FormComboBox
        control={control}
        name="branchId"
        label="Branch"
        placeholder={institutionId ? "Select branch" : "Select a bank first"}
        disabled={!institutionId}
        options={(branchesQuery.data ?? []).map((branch) => ({
          label: `${branch.branchName} — ${branch.city}`,
          value: branch.id,
        }))}
      />

      <FormComboBox
        control={control}
        name="propertyType"
        label="Property type"
        required
        options={PROPERTY_TYPES.map((type) => ({ label: type, value: type }))}
      />

      <FormInput control={control} name="bankReference" label="Bank reference" />

      <div className="sm:col-span-2">
        <FormInput
          control={control}
          name="propertyLocation"
          label="Property location"
          hint="Where the property is, for reference only — separate from the address as per deed or site visit captured in the valuation."
        />
      </div>
    </>
  );
}
