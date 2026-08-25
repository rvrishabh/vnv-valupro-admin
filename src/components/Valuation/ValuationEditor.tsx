import {
  useDownloadValuationPdfMutation,
  useRecalculateValuationMutation,
  useReviewValuationMutation,
  useSubmitValuationMutation,
  useUpdateValuationMutation,
} from "@/api/mutations/valuations";
import {
  useValuationOptionsQuery,
  useValuationPreviewQuery,
  useValuationQuery,
} from "@/api/queries/valuations";
import FormDropdown from "@/components/Form/FormDropdown";
import FormInput from "@/components/Form/FormInput";
import { FormTextArea } from "@/components/Form/FormTextArea";
import { AreaOfSite } from "@/components/Valuation/AreaOfSite";
import { CreatableSelect } from "@/components/Valuation/CreatableSelect";
import {
  BUILDING_SPEC_FIELDS,
  DISCREPANCY_FIELDS,
  GENERAL_FIELDS,
  LEASE_FIELDS,
  SITE_ADDRESS_FIELDS,
} from "@/components/Valuation/field-groups";
import { emptyFloor, FloorsEditor } from "@/components/Valuation/FloorsEditor";
import { FloorSpecsEditor } from "@/components/Valuation/FloorSpecsEditor";
import { OptionSelect } from "@/components/Valuation/OptionSelect";
import {
  FIELD_LABEL_CLASS,
  SectionFields,
} from "@/components/Valuation/SectionFields";
import { ValuationSummary } from "@/components/Valuation/ValuationSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toNumber, VALUATION_STATUS_VARIANT } from "@/lib/valuation-format";
import type {
  Direction,
  DirectionalMeasurement,
  DirectionalSection,
  Valuation,
  ValuationFormValues,
} from "@/types";
import { IconDownload, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

const METHODS = [
  { value: "LAND_AND_BUILDING", label: "Land & Building" },
  { value: "CRM", label: "Composite Rate (CRM)" },
  { value: "PLOT", label: "Vacant Plot" },
];

const DIMENSION_UNITS = [
  { value: "ft", label: "Feet" },
  { value: "m", label: "Metres" },
];

const DIRECTIONS: Direction[] = ["north", "south", "east", "west"];

/** M-Doc title-deed fields that are plain text in the sheet. */
const TITLE_DEED_TEXT_FIELDS = [
  { key: "deedNo", label: "Title deed no." },
  { key: "bahiNo", label: "Bahi no." },
  { key: "jildNo", label: "Jild no." },
  { key: "purchaseDate", label: "Date of purchase as per deed" },
  { key: "purchasePrice", label: "Purchase price as per deed" },
  { key: "sellers", label: "Name of sellers as per deed" },
] as const;

type FormState = ValuationFormValues;

const BOUNDARY_GRID = "grid-cols-[80px_1fr_1fr_110px_110px]";

/** Widens the API's loose per-direction blob into the form's fixed shape. */
function toDirectionalSection(
  source: Record<string, unknown> | null,
): DirectionalSection {
  const rows = (source ?? {}) as Record<string, DirectionalMeasurement | undefined>;
  return DIRECTIONS.reduce((section, direction) => {
    const row = rows[direction] ?? {};
    section[direction] = {
      asPerDocs: String(row.asPerDocs ?? ""),
      asPerSite: String(row.asPerSite ?? ""),
    };
    return section;
  }, {} as DirectionalSection);
}

function toFormState(v: Valuation): FormState {
  return {
    method: v.method,
    propertyType: v.propertyType ?? "",
    reportYear: String(v.reportYear ?? new Date().getFullYear()),
    dimensionUnit: (v.dimensionUnit as FormState["dimensionUnit"]) ?? "ft",
    areaAsPerDeed: String(toNumber(v.areaAsPerDeed) ?? ""),
    areaAsPerSite: String(toNumber(v.areaAsPerSite) ?? ""),
    advanceReceived: String(toNumber(v.advanceReceived) ?? ""),
    assetsSoldAsPerDeed: v.assetsSoldAsPerDeed ?? "",
    tenure: v.tenure ?? "",
    prevailingMarketRate: String(toNumber(v.prevailingMarketRate) ?? ""),
    circleRate: String(toNumber(v.circleRate) ?? ""),
    adoptedRate: String(toNumber(v.adoptedRate) ?? ""),
    plotPosition: v.plotPosition ?? "",
    // Stored as a fraction; shown as a percentage.
    superAreaPercent: String((toNumber(v.superAreaPercent) ?? 0) * 100),
    yearOfConstruction: String(v.yearOfConstruction ?? ""),
    expectedLifeYears: String(v.expectedLifeYears ?? 80),
    floors: (v.floors?.length ? v.floors : [emptyFloor(0)]).map((floor) => ({
      ...floor,
      yearOfConstruction: floor.yearOfConstruction ?? v.yearOfConstruction ?? undefined,
      expectedLifeYears: floor.expectedLifeYears ?? v.expectedLifeYears ?? undefined,
    })),
    titleDeed: v.titleDeed ?? {},
    leaseDetails: v.leaseDetails ?? {},
    siteAddress: v.siteAddress ?? {},
    discrepancy: v.discrepancy ?? {},
    boundaries: toDirectionalSection(v.boundaries),
    dimensions: toDirectionalSection(v.dimensions),
    buildingSpecs: v.buildingSpecs ?? {},
    generalDetails: v.generalDetails ?? {},
    engineerNotes: v.engineerNotes ?? "",
  };
}

export function ValuationEditor({ valuationId: id }: { valuationId: string }) {
  const valuationQuery = useValuationQuery(id);
  const optionsQuery = useValuationOptionsQuery();
  const previewQuery = useValuationPreviewQuery(id);

  const updateMutation = useUpdateValuationMutation();
  const submitMutation = useSubmitValuationMutation();
  const recalcMutation = useRecalculateValuationMutation();
  const reviewMutation = useReviewValuationMutation();
  const downloadMutation = useDownloadValuationPdfMutation();

  const form = useForm<FormState>();
  const reviewForm = useForm<{ notes: string }>({ defaultValues: { notes: "" } });
  const [isReady, setIsReady] = useState(false);

  const valuation = valuationQuery.data;
  const options = optionsQuery.data;

  useEffect(() => {
    if (valuation) {
      form.reset(toFormState(valuation));
      setIsReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuation]);

  const { control } = form;

  // Only the values this component itself branches on or displays — every
  // field renders through a Form component bound to `control`, so nothing
  // else needs to re-render on a keystroke.
  const method = useWatch({ control, name: "method" });
  const tenure = useWatch({ control, name: "tenure" });
  const dimensionUnit = useWatch({ control, name: "dimensionUnit" });
  const reportYear = useWatch({ control, name: "reportYear" });
  const yearOfConstruction = useWatch({ control, name: "yearOfConstruction" });
  const expectedLifeYears = useWatch({ control, name: "expectedLifeYears" });
  const boundaries = useWatch({ control, name: "boundaries" });
  const dimensions = useWatch({ control, name: "dimensions" });
  const ownerNameValue = useWatch({ control, name: "titleDeed.ownerName" });

  if (valuationQuery.isLoading || !isReady || !valuation) {
    return <p className="text-sm text-muted-foreground">Loading valuation…</p>;
  }

  const readOnly = valuation.status === "APPROVED";
  const isLeasehold = tenure === "Leasehold";
  const isPlot = method === "PLOT";

  /**
   * The building-level year and life are defaults, so changing one carries it
   * down to every floor still sitting on the old default. A floor the valuer
   * has given its own value is left alone — that is the whole point of setting
   * it — which is why the previous default is compared rather than blindly
   * overwritten.
   */
  const cascadeBuildingDefault = (
    key: "yearOfConstruction" | "expectedLifeYears",
    previousDefault: string,
    raw: string,
  ) => {
    const next = raw === "" ? undefined : Number(raw);

    form.getValues("floors").forEach((floor, index) => {
      const current = floor[key];
      const wasFollowing =
        current === undefined || String(current) === previousDefault;
      if (wasFollowing) {
        form.setValue(`floors.${index}.${key}`, next, { shouldDirty: true });
      }
    });
  };

  /**
   * The site column mirrors the documents until someone records something
   * different on site — the sheet does this literally (M-Doc!C96 = B96,
   * C78 = B78). Only a site value still equal to the previous documents value
   * is carried along, so a real site observation is never overwritten by a
   * later correction to the deed.
   */
  const mirrorDocsToSite = (
    section: "boundaries" | "dimensions",
    direction: Direction,
    raw: string,
  ) => {
    const row = (section === "boundaries" ? boundaries : dimensions)?.[direction] ?? {};
    const site = String(row.asPerSite ?? "");
    const previousDocs = String(row.asPerDocs ?? "");

    if (site === "" || site === previousDocs) {
      form.setValue(`${section}.${direction}.asPerSite`, raw, { shouldDirty: true });
    }
  };

  const onSave = (data: FormState) => {
    updateMutation.mutate({
      id,
      data: {
        method: data.method,
        propertyType: data.propertyType || undefined,
        reportYear: Number(data.reportYear) || undefined,
        // M-Rate's rate lookup keys off M-Doc!C48, which lives in the site
        // address block — so that is the single place the tehsil is entered.
        tehsil: String(data.siteAddress.tehsilForCircleRates ?? "") || undefined,
        dimensionUnit: data.dimensionUnit,
        areaAsPerDeed: Number(data.areaAsPerDeed) || undefined,
        areaAsPerSite: Number(data.areaAsPerSite) || undefined,
        advanceReceived: Number(data.advanceReceived) || undefined,
        assetsSoldAsPerDeed: data.assetsSoldAsPerDeed || undefined,
        tenure: data.tenure || undefined,
        // The backend drops this when tenure is Freehold.
        leaseDetails: data.tenure === "Leasehold" ? data.leaseDetails : undefined,
        land: {
          prevailingMarketRate: Number(data.prevailingMarketRate) || 0,
          circleRate: Number(data.circleRate) || 0,
          adoptedRate: Number(data.adoptedRate) || 0,
          plotPosition: data.plotPosition || "Intermittent Plot",
          superAreaPercent: (Number(data.superAreaPercent) || 0) / 100,
        },
        building: {
          yearOfConstruction: Number(data.yearOfConstruction) || 0,
          expectedLifeYears: Number(data.expectedLifeYears) || 80,
          floors: data.floors,
        },
        titleDeed: data.titleDeed,
        siteAddress: data.siteAddress,
        discrepancy: data.discrepancy,
        boundaries: data.boundaries,
        dimensions: data.dimensions,
        buildingSpecs: data.buildingSpecs,
        generalDetails: data.generalDetails,
        engineerNotes: data.engineerNotes || undefined,
      },
    });
  };

  const ownerName = String(ownerNameValue ?? "") || "Untitled draft";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{ownerName}</h3>
            <Badge variant={VALUATION_STATUS_VARIANT[valuation.status] ?? "outline"}>
              {valuation.status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => recalcMutation.mutate(id)}
              disabled={recalcMutation.isPending || readOnly}
            >
              <IconRefresh className="mr-1 size-4" />
              Recalculate
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => downloadMutation.mutate({ id })}
              disabled={downloadMutation.isPending}
            >
              <IconDownload className="mr-1 size-4" />
              {downloadMutation.isPending ? "Rendering…" : "Download PDF"}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || readOnly}>
              {updateMutation.isPending ? "Saving…" : "Save draft"}
            </Button>
            {valuation.status === "DRAFT" ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => submitMutation.mutate(id)}
                disabled={submitMutation.isPending}
              >
                Submit for review
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Tabs defaultValue="property">
            <TabsList className="flex-wrap">
              <TabsTrigger value="property">Property &amp; Title</TabsTrigger>
              <TabsTrigger value="address">Address &amp; Boundaries</TabsTrigger>
              <TabsTrigger value="rates">Rates &amp; Building</TabsTrigger>
              <TabsTrigger value="specs">Floor Specifications</TabsTrigger>
              <TabsTrigger value="general">General Details</TabsTrigger>
            </TabsList>

            {/* ---------------- Property & Title ---------------- */}
            <TabsContent value="property" className="mt-4 flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Basic / Office Data</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <FormDropdown
                    control={control}
                    name="method"
                    label="Method of valuation"
                    options={METHODS}
                    allowClear={false}
                    disabled={readOnly}
                  />

                  <CreatableSelect
                    control={control}
                    name="propertyType"
                    label="Specify type of property"
                    description="Pick from the list, or type a value that isn't there."
                    group="propertyType"
                    options={options}
                    disabled={readOnly}
                  />

                  <FormInput
                    control={control}
                    name="reportYear"
                    label="Report year"
                    labelClassName={FIELD_LABEL_CLASS}
                    hint="Ages are measured against this year."
                    type="number"
                    disabled={readOnly}
                  />

                  <FormInput
                    control={control}
                    name="advanceReceived"
                    label="Advance received (₹)"
                    labelClassName={FIELD_LABEL_CLASS}
                    type="number"
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Ownership &amp; Title Deed</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    control={control}
                    name="titleDeed.ownerName"
                    label="Name of the owner(s)"
                    labelClassName={FIELD_LABEL_CLASS}
                    disabled={readOnly}
                  />

                  <OptionSelect
                    control={control}
                    name="titleDeed.ownershipType"
                    label="Type of ownership"
                    group="ownershipType"
                    options={options}
                    disabled={readOnly}
                  />

                  <OptionSelect
                    control={control}
                    name="titleDeed.sharesDivided"
                    label="Are shares divided, then proportion"
                    group="sharesDivided"
                    options={options}
                    disabled={readOnly}
                  />

                  <OptionSelect
                    control={control}
                    name="assetsSoldAsPerDeed"
                    label="Assets sold as per title deed"
                    group="assetsSoldAsPerDeed"
                    options={options}
                    disabled={readOnly}
                  />

                  <FormTextArea
                    control={control}
                    name="titleDeed.addressAsPerDeed"
                    label="Address of property mentioned in the deed"
                    labelClassName={FIELD_LABEL_CLASS}
                    containerClassName="sm:col-span-2"
                    rows={2}
                    disabled={readOnly}
                  />

                  {TITLE_DEED_TEXT_FIELDS.map((field) => (
                    <FormInput
                      key={field.key}
                      control={control}
                      name={`titleDeed.${field.key}`}
                      label={field.label}
                      labelClassName={FIELD_LABEL_CLASS}
                      disabled={readOnly}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Freehold / Leasehold</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <OptionSelect
                    control={control}
                    name="tenure"
                    label="Leasehold / Freehold"
                    group="tenure"
                    options={options}
                    disabled={readOnly}
                  />

                  {/* The sheet strikes these through for a freehold property, so
                      they are hidden here rather than shown as N.A. */}
                  {isLeasehold ? (
                    <SectionFields
                      control={control}
                      section="leaseDetails"
                      fields={LEASE_FIELDS}
                      options={options}
                      disabled={readOnly}
                    />
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------------- Address & Boundaries ---------------- */}
            <TabsContent value="address" className="mt-4 flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Address as per Site Visit</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <SectionFields
                    control={control}
                    section="siteAddress"
                    fields={SITE_ADDRESS_FIELDS}
                    options={options}
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">Boundaries &amp; Dimensions</CardTitle>
                  {/* Both columns are captured in the same unit, as the sheet
                      does — the area below converts to Sq.m either way. */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Dimensions in</span>
                    <FormDropdown
                      control={control}
                      name="dimensionUnit"
                      options={DIMENSION_UNITS}
                      allowClear={false}
                      disabled={readOnly}
                      className="gap-0"
                      triggerClassName="h-8 w-[110px]"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div
                    className={`grid ${BOUNDARY_GRID} gap-3 text-xs font-medium text-muted-foreground`}
                  >
                    <span>Direction</span>
                    <span>As per documents</span>
                    <span>As per site</span>
                    <span>Dim. docs ({dimensionUnit})</span>
                    <span>Dim. site ({dimensionUnit})</span>
                  </div>

                  {DIRECTIONS.map((direction) => (
                    <div
                      key={direction}
                      className={`grid ${BOUNDARY_GRID} items-center gap-3`}
                    >
                      <span className="text-sm capitalize">{direction}</span>
                      <FormInput
                        control={control}
                        name={`boundaries.${direction}.asPerDocs`}
                        className="pb-0"
                        disabled={readOnly}
                        onValueChange={(_next, raw) =>
                          mirrorDocsToSite("boundaries", direction, raw)
                        }
                      />
                      <FormInput
                        control={control}
                        name={`boundaries.${direction}.asPerSite`}
                        className="pb-0"
                        disabled={readOnly}
                      />
                      <FormInput
                        control={control}
                        name={`dimensions.${direction}.asPerDocs`}
                        className="pb-0"
                        placeholder={dimensionUnit === "ft" ? "e.g. 30" : "e.g. 9.14"}
                        disabled={readOnly}
                        onValueChange={(_next, raw) =>
                          mirrorDocsToSite("dimensions", direction, raw)
                        }
                      />
                      <FormInput
                        control={control}
                        name={`dimensions.${direction}.asPerSite`}
                        className="pb-0"
                        placeholder={dimensionUnit === "ft" ? "e.g. 30" : "e.g. 9.14"}
                        disabled={readOnly}
                      />
                    </div>
                  ))}

                  <p className="text-xs text-muted-foreground">
                    The site columns copy the document columns as you type. Edit a
                    site value directly when the visit found something different —
                    it then stops following the deed.
                  </p>
                </CardContent>
              </Card>

              <AreaOfSite control={control} disabled={readOnly} />

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Discrepancy Check</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <SectionFields
                    control={control}
                    section="discrepancy"
                    fields={DISCREPANCY_FIELDS}
                    options={options}
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------------- Rates & Building ---------------- */}
            <TabsContent value="rates" className="mt-4 flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Land Rates</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    control={control}
                    name="prevailingMarketRate"
                    label="Prevailing market rate (₹/Sq.m)"
                    labelClassName={FIELD_LABEL_CLASS}
                    type="number"
                    disabled={readOnly}
                  />
                  <FormInput
                    control={control}
                    name="circleRate"
                    label="Guideline / circle rate (₹/Sq.m)"
                    labelClassName={FIELD_LABEL_CLASS}
                    type="number"
                    disabled={readOnly}
                  />
                  <FormInput
                    control={control}
                    name="adoptedRate"
                    label="Unit rate adopted (₹/Sq.m)"
                    labelClassName={FIELD_LABEL_CLASS}
                    type="number"
                    disabled={readOnly}
                  />
                  <OptionSelect
                    control={control}
                    name="plotPosition"
                    label="Corner plot or intermittent plot?"
                    description="Corner and park-facing plots attract a circle-rate uplift."
                    group="plotPosition"
                    options={options}
                    disabled={readOnly}
                  />
                  <FormInput
                    control={control}
                    name="superAreaPercent"
                    label="Extra for super area component (%)"
                    labelClassName={FIELD_LABEL_CLASS}
                    type="number"
                    step="0.01"
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Building Component</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      control={control}
                      name="yearOfConstruction"
                      label="Year of construction"
                      labelClassName={FIELD_LABEL_CLASS}
                      hint="Default for all floors; override per floor below."
                      type="number"
                      disabled={readOnly}
                      onValueChange={(_next, raw) =>
                        cascadeBuildingDefault(
                          "yearOfConstruction",
                          yearOfConstruction,
                          raw,
                        )
                      }
                    />
                    <FormInput
                      control={control}
                      name="expectedLifeYears"
                      label="Total estimated life (years)"
                      labelClassName={FIELD_LABEL_CLASS}
                      hint="Default for all floors; override per floor below."
                      type="number"
                      disabled={readOnly}
                      onValueChange={(_next, raw) =>
                        cascadeBuildingDefault(
                          "expectedLifeYears",
                          expectedLifeYears,
                          raw,
                        )
                      }
                    />
                    <OptionSelect
                      control={control}
                      name="buildingSpecs.totalFloors"
                      label="Total no. of floors"
                      group="totalFloors"
                      options={options}
                      disabled={readOnly}
                    />
                    <OptionSelect
                      control={control}
                      name="buildingSpecs.coveredAreaConsideration"
                      label="Covered area under consideration"
                      group="coveredAreaConsideration"
                      options={options}
                      disabled={readOnly}
                    />
                  </div>
                  <FloorsEditor
                    control={control}
                    disabled={readOnly || isPlot}
                    buildingYear={Number(yearOfConstruction) || 0}
                    buildingLife={Number(expectedLifeYears) || 80}
                    reportYear={Number(reportYear) || new Date().getFullYear()}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Building Specifications</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <SectionFields
                    control={control}
                    section="buildingSpecs"
                    fields={BUILDING_SPEC_FIELDS}
                    options={options}
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------------- Floor Specifications ---------------- */}
            <TabsContent value="specs" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Specifications &amp; Covered Area Rates — per floor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FloorSpecsEditor
                    control={control}
                    options={options}
                    disabled={readOnly || isPlot}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------------- General ---------------- */}
            <TabsContent value="general" className="mt-4 flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Approval, Occupancy &amp; Locational Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <SectionFields
                    control={control}
                    section="generalDetails"
                    fields={GENERAL_FIELDS}
                    options={options}
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Engineer Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormTextArea
                    control={control}
                    name="engineerNotes"
                    rows={4}
                    disabled={readOnly}
                  />
                </CardContent>
              </Card>

              {valuation.status === "SUBMITTED" ? (
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
                      <Button
                        type="button"
                        onClick={() =>
                          reviewMutation.mutate({
                            id,
                            data: {
                              decision: "approved",
                              notes: reviewForm.getValues("notes"),
                            },
                          })
                        }
                        disabled={reviewMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() =>
                          reviewMutation.mutate({
                            id,
                            data: {
                              decision: "rejected",
                              notes: reviewForm.getValues("notes"),
                            },
                          })
                        }
                        disabled={reviewMutation.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
          </Tabs>

          <div className="lg:sticky lg:top-4 lg:self-start">
            <ValuationSummary
              result={previewQuery.data ?? valuation.computed ?? undefined}
              isLoading={previewQuery.isLoading}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
