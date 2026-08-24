import { useCreateCaseMutation } from "@/api/mutations/cases";
import { useCreateValuationMutation } from "@/api/mutations/valuations";
import { useInstitutionsQuery } from "@/api/queries/institutions";
import FormComboBox from "@/components/Form/FormComboBox";
import FormInput from "@/components/Form/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { createCasePayloadSchema } from "@/schemas";
import type { CreateCasePayload, PropertyType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

const PROPERTY_TYPES: PropertyType[] = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "LAND",
  "INDUSTRIAL",
];

/**
 * Opens a case and its draft valuation together, then hands off to the
 * case's Valuation tab to fill in the detail — cases and valuations are one
 * surface in the frontend, so there's no separate "new valuation" screen.
 */
export function NewCaseForm() {
  const navigate = useNavigate();
  const institutionsQuery = useInstitutionsQuery({ page: 1, limit: 100 });
  const createCase = useCreateCaseMutation();
  const createValuation = useCreateValuationMutation();

  const form = useForm<CreateCasePayload>({
    resolver: zodResolver(createCasePayloadSchema),
    defaultValues: {
      customerName: "",
      customerMobile: "",
      institutionId: "",
      propertyType: "RESIDENTIAL",
    },
  });

  const isBusy = createCase.isPending || createValuation.isPending;

  const onSubmit = async (values: CreateCasePayload) => {
    const created = await createCase.mutateAsync({
      customerName: values.customerName,
      customerMobile: values.customerMobile,
      institutionId: values.institutionId,
      propertyType: values.propertyType,
    });

    await createValuation.mutateAsync({
      caseId: created.id,
      reportYear: new Date().getFullYear(),
      titleDeed: { ownerName: values.customerName },
    });

    navigate({
      to: "/cases/$id",
      params: { id: created.id },
      search: { tab: "valuation" },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex max-w-2xl flex-col gap-5"
      >
        <div>
          <h2 className="font-display text-xl font-semibold">New Case</h2>
          <p className="text-sm text-muted-foreground">
            Opens the case and a draft valuation.{" "}
            <Link to="/cases" className="underline">
              Cancel
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Case Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormInput
              control={form.control}
              name="customerName"
              label="Customer / owner name"
              required
            />

            <FormInput
              control={form.control}
              name="customerMobile"
              label="Contact mobile"
              required
            />

            <FormComboBox
              control={form.control}
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
              control={form.control}
              name="propertyType"
              label="Property type"
              required
              options={PROPERTY_TYPES.map((type) => ({ label: type, value: type }))}
            />
          </CardContent>
        </Card>

        <div>
          <Button type="submit" disabled={isBusy}>
            {isBusy ? "Creating…" : "Create & continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
