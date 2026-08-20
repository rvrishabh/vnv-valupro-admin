import { createCasePayloadSchema, useCreateCaseMutation } from "@/api/mutations/cases";
import { useCreateValuationMutation } from "@/api/mutations/valuations";
import { useInstitutionsQuery } from "@/api/queries/institutions";
import FormInput from "@/components/Form/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PropertyType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/valuations/new")({
  component: NewValuationPage,
});

const PROPERTY_TYPES: PropertyType[] = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "LAND",
  "INDUSTRIAL",
];

const formSchema = createCasePayloadSchema.extend({
  tehsil: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

/**
 * A valuation always hangs off a case, so this page opens the case and its
 * draft valuation together — the engineer then fills the detail in the editor.
 */
function NewValuationPage() {
  const navigate = useNavigate();
  const institutionsQuery = useInstitutionsQuery({ page: 1, limit: 100 });
  const createCase = useCreateCaseMutation();
  const createValuation = useCreateValuationMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerMobile: "",
      institutionId: "",
      propertyType: "RESIDENTIAL",
      propertyLocation: "",
      bankReference: "",
      tehsil: "",
    },
  });

  const isBusy = createCase.isPending || createValuation.isPending;

  const onSubmit = async (values: FormValues) => {
    const created = await createCase.mutateAsync({
      customerName: values.customerName,
      customerMobile: values.customerMobile,
      institutionId: values.institutionId,
      propertyType: values.propertyType,
      propertyLocation: values.propertyLocation || undefined,
      bankReference: values.bankReference || undefined,
    });

    const valuation = await createValuation.mutateAsync({
      caseId: created.id,
      reportYear: new Date().getFullYear(),
      tehsil: values.tehsil || undefined,
      titleDeed: { ownerName: values.customerName },
    });

    navigate({ to: "/valuations/$id", params: { id: valuation.id } });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex max-w-2xl flex-col gap-5"
      >
        <div>
          <h2 className="font-display text-xl font-semibold">New Valuation</h2>
          <p className="text-sm text-muted-foreground">
            Opens the case and a draft valuation.{" "}
            <Link to="/valuations" className="underline">
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

            <FormField
              control={form.control}
              name="institutionId"
              render={({ field }) => (
                <FormItem className="w-full pb-2">
                  <FormLabel>
                    Bank <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(institutionsQuery.data?.data ?? []).map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem className="w-full pb-2">
                  <FormLabel>Property type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormInput
              control={form.control}
              name="propertyLocation"
              label="Property location"
              className="sm:col-span-2"
            />

            <FormInput control={form.control} name="tehsil" label="Tehsil" />

            <FormInput
              control={form.control}
              name="bankReference"
              label="Bank reference no."
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
