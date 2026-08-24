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
import { Field, SectionFields } from "@/components/Valuation/SectionFields";
import { ValuationSummary } from "@/components/Valuation/ValuationSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toNumber, VALUATION_STATUS_VARIANT } from "@/lib/valuation-format";
import type { FloorInput, Valuation } from "@/types";
import { IconDownload, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const METHODS = [
  { value: "LAND_AND_BUILDING", label: "Land & Building" },
  { value: "CRM", label: "Composite Rate (CRM)" },
  { value: "PLOT", label: "Vacant Plot" },
];

const DIRECTIONS = ["north", "south", "east", "west"] as const;

type Section = Record<string, unknown>;

interface FormState {
  method: Valuation["method"];
  propertyType: string;
  reportYear: string;
  tehsil: string;
  plotAreaSqM: string;
  advanceReceived: string;
  assetsSoldAsPerDeed: string;
  tenure: string;
  prevailingMarketRate: string;
  circleRate: string;
  adoptedRate: string;
  plotPosition: string;
  superAreaPercent: string;
  yearOfConstruction: string;
  expectedLifeYears: string;
  floors: FloorInput[];
  titleDeed: Section;
  leaseDetails: Section;
  siteAddress: Section;
  discrepancy: Section;
  boundaries: Section;
  dimensions: Section;
  buildingSpecs: Section;
  generalDetails: Section;
  engineerNotes: string;
}

function toFormState(v: Valuation): FormState {
  return {
    method: v.method,
    propertyType: v.propertyType ?? "",
    reportYear: String(v.reportYear ?? new Date().getFullYear()),
    tehsil: v.tehsil ?? "",
    plotAreaSqM: String(toNumber(v.plotAreaSqM) ?? ""),
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
    floors: v.floors?.length ? v.floors : [emptyFloor(0)],
    titleDeed: v.titleDeed ?? {},
    leaseDetails: v.leaseDetails ?? {},
    siteAddress: v.siteAddress ?? {},
    discrepancy: v.discrepancy ?? {},
    boundaries: v.boundaries ?? {},
    dimensions: v.dimensions ?? {},
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

  const [form, setForm] = useState<FormState | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const valuation = valuationQuery.data;
  const options = optionsQuery.data;

  useEffect(() => {
    if (valuation) setForm(toFormState(valuation));
  }, [valuation]);

  if (valuationQuery.isLoading || !form || !valuation) {
    return <p className="text-sm text-muted-foreground">Loading valuation…</p>;
  }

  const readOnly = valuation.status === "APPROVED";
  const isLeasehold = form.tenure === "Leasehold";
  const isPlot = form.method === "PLOT";

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const setIn = (section: keyof FormState, key: string, value: unknown) =>
    setForm((prev) =>
      prev
        ? { ...prev, [section]: { ...(prev[section] as Section), [key]: value } }
        : prev,
    );

  const handleSave = () => {
    updateMutation.mutate({
      id,
      data: {
        method: form.method,
        propertyType: form.propertyType || undefined,
        reportYear: Number(form.reportYear) || undefined,
        tehsil: form.tehsil || undefined,
        plotAreaSqM: Number(form.plotAreaSqM) || undefined,
        advanceReceived: Number(form.advanceReceived) || undefined,
        assetsSoldAsPerDeed: form.assetsSoldAsPerDeed || undefined,
        tenure: form.tenure || undefined,
        // The backend drops this when tenure is Freehold.
        leaseDetails: isLeasehold ? form.leaseDetails : undefined,
        land: {
          prevailingMarketRate: Number(form.prevailingMarketRate) || 0,
          circleRate: Number(form.circleRate) || 0,
          adoptedRate: Number(form.adoptedRate) || 0,
          plotPosition: form.plotPosition || "Intermittent Plot",
          superAreaPercent: (Number(form.superAreaPercent) || 0) / 100,
        },
        building: {
          yearOfConstruction: Number(form.yearOfConstruction) || 0,
          expectedLifeYears: Number(form.expectedLifeYears) || 80,
          floors: form.floors,
        },
        titleDeed: form.titleDeed,
        siteAddress: form.siteAddress,
        discrepancy: form.discrepancy,
        boundaries: form.boundaries,
        dimensions: form.dimensions,
        buildingSpecs: form.buildingSpecs,
        generalDetails: form.generalDetails,
        engineerNotes: form.engineerNotes || undefined,
      },
    });
  };

  const ownerName = String(form.titleDeed.ownerName ?? "") || "Untitled draft";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{ownerName}</h3>
          <Badge variant={VALUATION_STATUS_VARIANT[valuation.status] ?? "outline"}>
            {valuation.status}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => recalcMutation.mutate(id)}
            disabled={recalcMutation.isPending || readOnly}
          >
            <IconRefresh className="mr-1 size-4" />
            Recalculate
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadMutation.mutate({ id })}
            disabled={downloadMutation.isPending}
          >
            <IconDownload className="mr-1 size-4" />
            {downloadMutation.isPending ? "Rendering…" : "Download PDF"}
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending || readOnly}>
            {updateMutation.isPending ? "Saving…" : "Save draft"}
          </Button>
          {valuation.status === "DRAFT" ? (
            <Button
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
                <Field label="Method of valuation">
                  <Select
                    value={form.method}
                    disabled={readOnly}
                    onValueChange={(v) => set("method", v as Valuation["method"])}
                  >
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  label="Specify type of property"
                  hint="Pick from the list, or type a value that isn't there."
                >
                  <CreatableSelect
                    group="propertyType"
                    options={options}
                    value={form.propertyType}
                    disabled={readOnly}
                    onChange={(v) => set("propertyType", v)}
                  />
                </Field>

                <Field label="Report year" hint="Ages are measured against this year.">
                  <Input
                    type="number"
                    value={form.reportYear}
                    disabled={readOnly}
                    onChange={(e) => set("reportYear", e.target.value)}
                  />
                </Field>

                <Field label="Advance received (₹)">
                  <Input
                    type="number"
                    value={form.advanceReceived}
                    disabled={readOnly}
                    onChange={(e) => set("advanceReceived", e.target.value)}
                  />
                </Field>

                <Field label="Tehsil (for circle & construction rates)">
                  <OptionSelect
                    group="tehsil"
                    options={options}
                    value={form.tehsil}
                    disabled={readOnly}
                    onChange={(v) => set("tehsil", v)}
                  />
                </Field>

                <Field label="Plot area under consideration (Sq.m)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.plotAreaSqM}
                    disabled={readOnly}
                    onChange={(e) => set("plotAreaSqM", e.target.value)}
                  />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ownership &amp; Title Deed</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Name of the owner(s)">
                  <Input
                    value={String(form.titleDeed.ownerName ?? "")}
                    disabled={readOnly}
                    onChange={(e) => setIn("titleDeed", "ownerName", e.target.value)}
                  />
                </Field>

                <Field label="Type of ownership">
                  <OptionSelect
                    group="ownershipType"
                    options={options}
                    value={String(form.titleDeed.ownershipType ?? "")}
                    disabled={readOnly}
                    onChange={(v) => setIn("titleDeed", "ownershipType", v)}
                  />
                </Field>

                <Field label="Are shares divided, then proportion">
                  <OptionSelect
                    group="sharesDivided"
                    options={options}
                    value={String(form.titleDeed.sharesDivided ?? "")}
                    disabled={readOnly}
                    onChange={(v) => setIn("titleDeed", "sharesDivided", v)}
                  />
                </Field>

                <Field label="Assets sold as per title deed">
                  <OptionSelect
                    group="assetsSoldAsPerDeed"
                    options={options}
                    value={form.assetsSoldAsPerDeed}
                    disabled={readOnly}
                    onChange={(v) => set("assetsSoldAsPerDeed", v)}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Address of property mentioned in the deed">
                    <Textarea
                      rows={2}
                      value={String(form.titleDeed.addressAsPerDeed ?? "")}
                      disabled={readOnly}
                      onChange={(e) => setIn("titleDeed", "addressAsPerDeed", e.target.value)}
                    />
                  </Field>
                </div>

                {[
                  ["deedNo", "Title deed no."],
                  ["bahiNo", "Bahi no."],
                  ["jildNo", "Jild no."],
                  ["purchaseDate", "Date of purchase as per deed"],
                  ["purchasePrice", "Purchase price as per deed"],
                  ["sellers", "Name of sellers as per deed"],
                ].map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      value={String(form.titleDeed[key] ?? "")}
                      disabled={readOnly}
                      onChange={(e) => setIn("titleDeed", key, e.target.value)}
                    />
                  </Field>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Freehold / Leasehold</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Leasehold / Freehold">
                  <OptionSelect
                    group="tenure"
                    options={options}
                    value={form.tenure}
                    disabled={readOnly}
                    onChange={(v) => set("tenure", v)}
                  />
                </Field>

                {/* The sheet strikes these through for a freehold property, so
                    they are hidden here rather than shown as N.A. */}
                {isLeasehold ? (
                  <SectionFields
                    fields={LEASE_FIELDS}
                    values={form.leaseDetails}
                    options={options}
                    disabled={readOnly}
                    onChange={(k, v) => setIn("leaseDetails", k, v)}
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
                  fields={SITE_ADDRESS_FIELDS}
                  values={form.siteAddress}
                  options={options}
                  disabled={readOnly}
                  onChange={(k, v) => setIn("siteAddress", k, v)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Boundaries &amp; Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-[80px_1fr_1fr_110px_110px] gap-3 text-xs font-medium text-muted-foreground">
                  <span>Direction</span>
                  <span>As per documents</span>
                  <span>As per site</span>
                  <span>Dim. (docs)</span>
                  <span>Dim. (site)</span>
                </div>
                {DIRECTIONS.map((direction) => {
                  const bound = (form.boundaries[direction] as Section) ?? {};
                  const dim = (form.dimensions[direction] as Section) ?? {};
                  const patch = (
                    section: "boundaries" | "dimensions",
                    field: string,
                    value: string,
                  ) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            [section]: {
                              ...(prev[section] as Section),
                              [direction]: {
                                ...((prev[section] as Section)[direction] as Section),
                                [field]: value,
                              },
                            },
                          }
                        : prev,
                    );

                  return (
                    <div
                      key={direction}
                      className="grid grid-cols-[80px_1fr_1fr_110px_110px] items-center gap-3"
                    >
                      <span className="text-sm capitalize">{direction}</span>
                      <Input
                        value={String(bound.asPerDocs ?? "")}
                        disabled={readOnly}
                        onChange={(e) => patch("boundaries", "asPerDocs", e.target.value)}
                      />
                      <Input
                        value={String(bound.asPerSite ?? "")}
                        disabled={readOnly}
                        onChange={(e) => patch("boundaries", "asPerSite", e.target.value)}
                      />
                      <Input
                        value={String(dim.asPerDocs ?? "")}
                        disabled={readOnly}
                        onChange={(e) => patch("dimensions", "asPerDocs", e.target.value)}
                      />
                      <Input
                        value={String(dim.asPerSite ?? "")}
                        disabled={readOnly}
                        onChange={(e) => patch("dimensions", "asPerSite", e.target.value)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Discrepancy Check</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <SectionFields
                  fields={DISCREPANCY_FIELDS}
                  values={form.discrepancy}
                  options={options}
                  disabled={readOnly}
                  onChange={(k, v) => setIn("discrepancy", k, v)}
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
                <Field label="Prevailing market rate (₹/Sq.m)">
                  <Input type="number" value={form.prevailingMarketRate} disabled={readOnly}
                    onChange={(e) => set("prevailingMarketRate", e.target.value)} />
                </Field>
                <Field label="Guideline / circle rate (₹/Sq.m)">
                  <Input type="number" value={form.circleRate} disabled={readOnly}
                    onChange={(e) => set("circleRate", e.target.value)} />
                </Field>
                <Field label="Unit rate adopted (₹/Sq.m)">
                  <Input type="number" value={form.adoptedRate} disabled={readOnly}
                    onChange={(e) => set("adoptedRate", e.target.value)} />
                </Field>
                <Field
                  label="Corner plot or intermittent plot?"
                  hint="Corner and park-facing plots attract a circle-rate uplift."
                >
                  <OptionSelect
                    group="plotPosition"
                    options={options}
                    value={form.plotPosition}
                    disabled={readOnly}
                    onChange={(v) => set("plotPosition", v)}
                  />
                </Field>
                <Field label="Extra for super area component (%)">
                  <Input type="number" step="0.01" value={form.superAreaPercent} disabled={readOnly}
                    onChange={(e) => set("superAreaPercent", e.target.value)} />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Building Component</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Year of construction">
                    <Input type="number" value={form.yearOfConstruction} disabled={readOnly}
                      onChange={(e) => set("yearOfConstruction", e.target.value)} />
                  </Field>
                  <Field label="Total estimated life (years)">
                    <Input type="number" value={form.expectedLifeYears} disabled={readOnly}
                      onChange={(e) => set("expectedLifeYears", e.target.value)} />
                  </Field>
                  <Field label="Total no. of floors">
                    <OptionSelect
                      group="totalFloors"
                      options={options}
                      value={String(form.buildingSpecs.totalFloors ?? "")}
                      disabled={readOnly}
                      onChange={(v) => setIn("buildingSpecs", "totalFloors", v)}
                    />
                  </Field>
                  <Field label="Covered area under consideration">
                    <OptionSelect
                      group="coveredAreaConsideration"
                      options={options}
                      value={String(form.buildingSpecs.coveredAreaConsideration ?? "")}
                      disabled={readOnly}
                      onChange={(v) => setIn("buildingSpecs", "coveredAreaConsideration", v)}
                    />
                  </Field>
                </div>
                <FloorsEditor
                  floors={form.floors}
                  disabled={readOnly || isPlot}
                  onChange={(floors) => set("floors", floors)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Building Specifications</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <SectionFields
                  fields={BUILDING_SPEC_FIELDS}
                  values={form.buildingSpecs}
                  options={options}
                  disabled={readOnly}
                  onChange={(k, v) => setIn("buildingSpecs", k, v)}
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
                  floors={form.floors}
                  options={options}
                  disabled={readOnly || isPlot}
                  onChange={(floors) => set("floors", floors)}
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
                  fields={GENERAL_FIELDS}
                  values={form.generalDetails}
                  options={options}
                  disabled={readOnly}
                  onChange={(k, v) => setIn("generalDetails", k, v)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Engineer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  value={form.engineerNotes}
                  disabled={readOnly}
                  onChange={(e) => set("engineerNotes", e.target.value)}
                />
              </CardContent>
            </Card>

            {valuation.status === "SUBMITTED" ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Checker Review</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Textarea
                    rows={3}
                    placeholder="Review notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        reviewMutation.mutate({
                          id,
                          data: { decision: "approved", notes: reviewNotes },
                        })
                      }
                      disabled={reviewMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        reviewMutation.mutate({
                          id,
                          data: { decision: "rejected", notes: reviewNotes },
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
    </div>
  );
}
