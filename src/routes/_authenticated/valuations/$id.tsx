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
import { emptyFloor, FloorsEditor } from "@/components/Valuation/FloorsEditor";
import { ValuationSummary } from "@/components/Valuation/ValuationSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/valuations/$id")({
  component: ValuationEditorPage,
});

const PLOT_POSITIONS = [
  "Intermittent Plot",
  "2 Side Road Facing Plot",
  "Park Facing",
  "Park & 2 Side Road Facing Plot",
  "Flat",
];

const METHODS = [
  { value: "LAND_AND_BUILDING", label: "Land & Building" },
  { value: "CRM", label: "Composite Rate (CRM)" },
  { value: "PLOT", label: "Vacant Plot" },
];

const DIRECTIONS = ["north", "south", "east", "west"] as const;

/** Local mirror of the draft; sections are saved as one PATCH. */
interface FormState {
  method: Valuation["method"];
  reportYear: string;
  tehsil: string;
  plotAreaSqM: string;
  prevailingMarketRate: string;
  circleRate: string;
  adoptedRate: string;
  plotPosition: string;
  superAreaPercent: string;
  yearOfConstruction: string;
  expectedLifeYears: string;
  floors: FloorInput[];
  titleDeed: Record<string, string>;
  boundaries: Record<string, unknown>;
  dimensions: Record<string, unknown>;
  buildingSpecs: Record<string, string>;
  generalDetails: Record<string, string>;
  engineerNotes: string;
}

function toFormState(valuation: Valuation): FormState {
  return {
    method: valuation.method,
    reportYear: String(valuation.reportYear ?? new Date().getFullYear()),
    tehsil: valuation.tehsil ?? "",
    plotAreaSqM: String(toNumber(valuation.plotAreaSqM) ?? ""),
    prevailingMarketRate: String(toNumber(valuation.prevailingMarketRate) ?? ""),
    circleRate: String(toNumber(valuation.circleRate) ?? ""),
    adoptedRate: String(toNumber(valuation.adoptedRate) ?? ""),
    plotPosition: valuation.plotPosition ?? "Intermittent Plot",
    // Stored as a fraction; shown as a percentage.
    superAreaPercent: String((toNumber(valuation.superAreaPercent) ?? 0) * 100),
    yearOfConstruction: String(valuation.yearOfConstruction ?? ""),
    expectedLifeYears: String(valuation.expectedLifeYears ?? 80),
    floors: valuation.floors?.length ? valuation.floors : [emptyFloor(0)],
    titleDeed: (valuation.titleDeed as Record<string, string>) ?? {},
    boundaries: valuation.boundaries ?? {},
    dimensions: valuation.dimensions ?? {},
    buildingSpecs: (valuation.buildingSpecs as Record<string, string>) ?? {},
    generalDetails: (valuation.generalDetails as Record<string, string>) ?? {},
    engineerNotes: valuation.engineerNotes ?? "",
  };
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

function ValuationEditorPage() {
  const { id } = Route.useParams();
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

  useEffect(() => {
    if (valuation) setForm(toFormState(valuation));
  }, [valuation]);

  const readOnly = valuation?.status === "APPROVED";

  const tehsilOptions = useMemo(
    () => optionsQuery.data?.["Branches"] ?? [],
    [optionsQuery.data],
  );

  if (valuationQuery.isLoading || !form || !valuation) {
    return <p className="text-sm text-muted-foreground">Loading valuation…</p>;
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const setNested = (
    section: "titleDeed" | "buildingSpecs" | "generalDetails",
    key: string,
    value: string,
  ) =>
    setForm((prev) =>
      prev ? { ...prev, [section]: { ...prev[section], [key]: value } } : prev,
    );

  const handleSave = () => {
    updateMutation.mutate({
      id,
      data: {
        method: form.method,
        reportYear: Number(form.reportYear) || undefined,
        tehsil: form.tehsil || undefined,
        plotAreaSqM: Number(form.plotAreaSqM) || undefined,
        land: {
          prevailingMarketRate: Number(form.prevailingMarketRate) || 0,
          circleRate: Number(form.circleRate) || 0,
          adoptedRate: Number(form.adoptedRate) || 0,
          plotPosition: form.plotPosition,
          superAreaPercent: (Number(form.superAreaPercent) || 0) / 100,
        },
        building: {
          yearOfConstruction: Number(form.yearOfConstruction) || 0,
          expectedLifeYears: Number(form.expectedLifeYears) || 80,
          floors: form.floors,
        },
        titleDeed: form.titleDeed,
        boundaries: form.boundaries,
        dimensions: form.dimensions,
        buildingSpecs: form.buildingSpecs,
        generalDetails: form.generalDetails,
        engineerNotes: form.engineerNotes || undefined,
      },
    });
  };

  const ownerName = form.titleDeed.ownerName || "Untitled draft";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold">{ownerName}</h2>
            <Badge variant={VALUATION_STATUS_VARIANT[valuation.status] ?? "outline"}>
              {valuation.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {valuation.case?.institution?.name ?? "Bank"} ·{" "}
            {valuation.case?.caseNumber ?? valuation.caseId.slice(0, 8)}
            {" · "}
            <Link to="/valuations" className="underline">
              Back to list
            </Link>
          </p>
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
            onClick={() =>
              downloadMutation.mutate({
                id,
                filename: `${ownerName.replace(/\s+/g, "-").toLowerCase()}-valuation.pdf`,
              })
            }
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
          <TabsList>
            <TabsTrigger value="property">Property &amp; Title</TabsTrigger>
            <TabsTrigger value="rates">Rates &amp; Building</TabsTrigger>
            <TabsTrigger value="general">General Details</TabsTrigger>
          </TabsList>

          <TabsContent value="property" className="mt-4 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Basic</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Method of valuation">
                  <Select
                    value={form.method}
                    disabled={readOnly}
                    onValueChange={(v) => set("method", v as Valuation["method"])}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Report year" hint="Ages are measured against this year.">
                  <Input
                    type="number"
                    value={form.reportYear}
                    disabled={readOnly}
                    onChange={(e) => set("reportYear", e.target.value)}
                  />
                </Field>
                <Field label="Tehsil (for circle & construction rates)">
                  {tehsilOptions.length ? (
                    <Select
                      value={form.tehsil}
                      disabled={readOnly}
                      onValueChange={(v) => set("tehsil", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select tehsil" /></SelectTrigger>
                      <SelectContent>
                        {tehsilOptions.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={form.tehsil}
                      disabled={readOnly}
                      onChange={(e) => set("tehsil", e.target.value)}
                    />
                  )}
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
                <CardTitle className="text-base">Title Deed</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  ["ownerName", "Name of the owner(s)"],
                  ["ownershipType", "Type of ownership"],
                  ["addressAsPerDeed", "Address as per deed"],
                  ["deedNo", "Title deed no."],
                  ["bahiNo", "Bahi no."],
                  ["jildNo", "Jild no."],
                  ["purchasePrice", "Purchase price as per deed"],
                  ["tenure", "Leasehold / Freehold"],
                ].map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      value={form.titleDeed[key] ?? ""}
                      disabled={readOnly}
                      onChange={(e) => setNested("titleDeed", key, e.target.value)}
                    />
                  </Field>
                ))}
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
                  const bound =
                    (form.boundaries[direction] as Record<string, string>) ?? {};
                  const dim =
                    (form.dimensions[direction] as Record<string, string>) ?? {};
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
                              ...prev[section],
                              [direction]: {
                                ...((prev[section][direction] as object) ?? {}),
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
                        value={bound.asPerDocs ?? ""}
                        disabled={readOnly}
                        onChange={(e) => patch("boundaries", "asPerDocs", e.target.value)}
                      />
                      <Input
                        value={bound.asPerSite ?? ""}
                        disabled={readOnly}
                        onChange={(e) => patch("boundaries", "asPerSite", e.target.value)}
                      />
                      <Input
                        value={dim.asPerDocs ?? ""}
                        disabled={readOnly}
                        onChange={(e) => patch("dimensions", "asPerDocs", e.target.value)}
                      />
                      <Input
                        value={dim.asPerSite ?? ""}
                        disabled={readOnly}
                        onChange={(e) => patch("dimensions", "asPerSite", e.target.value)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

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
                <Field label="Plot position" hint="Corner and park-facing plots attract a circle-rate uplift.">
                  <Select value={form.plotPosition} disabled={readOnly}
                    onValueChange={(v) => set("plotPosition", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLOT_POSITIONS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Super area component (%)">
                  <Input type="number" step="0.01" value={form.superAreaPercent} disabled={readOnly}
                    onChange={(e) => set("superAreaPercent", e.target.value)} />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Building</CardTitle>
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
                </div>
                <FloorsEditor
                  floors={form.floors}
                  disabled={readOnly || form.method === "PLOT"}
                  onChange={(floors) => set("floors", floors)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Building Specifications</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  ["typeOfConstruction", "Type of construction"],
                  ["foundation", "Type of foundation"],
                  ["quality", "Quality of construction"],
                  ["stage", "Stage of construction"],
                  ["typeOfRoad", "Type of road"],
                  ["widthOfRoad", "Width of road"],
                  ["waterSupply", "Water supply"],
                  ["sewerage", "Sewerage"],
                  ["maintenance", "General maintenance"],
                  ["exterior", "Exterior"],
                  ["interior", "Interior"],
                ].map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      value={form.buildingSpecs[key] ?? ""}
                      disabled={readOnly}
                      onChange={(e) => setNested("buildingSpecs", key, e.target.value)}
                    />
                  </Field>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="mt-4 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Locational &amp; General</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  ["landUse", "Approved land use"],
                  ["classOfLocality", "Classification of locality"],
                  ["development", "Development of surrounding area"],
                  ["occupancy", "Occupancy"],
                  ["marketability", "Marketability"],
                  ["plotShape", "Shape of plot"],
                ].map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      value={form.generalDetails[key] ?? ""}
                      disabled={readOnly}
                      onChange={(e) => setNested("generalDetails", key, e.target.value)}
                    />
                  </Field>
                ))}
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
