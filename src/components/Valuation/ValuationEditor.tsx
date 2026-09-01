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
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressBoundariesTab } from "@/components/Valuation/AddressBoundariesTab";
import { FloorSpecificationsTab } from "@/components/Valuation/FloorSpecificationsTab";
import { GeneralDetailsTab } from "@/components/Valuation/GeneralDetailsTab";
import { PropertyTitleTab } from "@/components/Valuation/PropertyTitleTab";
import { RatesBuildingTab } from "@/components/Valuation/RatesBuildingTab";
import { SitePhotosTab } from "@/components/Valuation/SitePhotosTab";
import { ValuationEditorHeader } from "@/components/Valuation/ValuationEditorHeader";
import { ValuationSummary } from "@/components/Valuation/ValuationSummary";
import {
  toFormState,
  type FormState,
} from "@/components/Valuation/valuation-form.utils";
import type { Direction } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

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
  const reviewForm = useForm<{ notes: string }>({
    defaultValues: { notes: "" },
  });
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
  const roomCounts = useWatch({ control, name: "rooms" });
  const coveredAreaConsideration = useWatch({
    control,
    name: "buildingSpecs.coveredAreaConsideration",
  }) as string | undefined;
  const propertyTypeValue = useWatch({ control, name: "propertyType" });
  const gpsCoordinatesValue = useWatch({ control, name: "gpsCoordinates" });

  /**
   * M-Doc!C120 — the sentence the report prints, rebuilt from the counts so it
   * can never drift from the numbers above it.
   */
  const roomsSummary = useMemo(() => {
    const parts = (
      [
        ["Living Rooms", roomCounts?.livingRooms],
        ["Bed rooms", roomCounts?.bedRooms],
        ["Water Closets", roomCounts?.waterClosets],
        ["Kitchen", roomCounts?.kitchen],
      ] as [string, unknown][]
    )
      .filter(([, count]) => Number(count) > 0)
      .map(([label, count]) => `${count} ${label}`);

    if (!parts.length) return null;

    const subject = propertyTypeValue || "Property";
    const last = parts.pop();
    return parts.length
      ? `${subject} has total of ${parts.join(", ")} & ${last}`
      : `${subject} has total of ${last}`;
  }, [roomCounts, propertyTypeValue]);
  const reportYear = useWatch({ control, name: "reportYear" });
  const yearOfConstruction = useWatch({ control, name: "yearOfConstruction" });
  const expectedLifeYears = useWatch({ control, name: "expectedLifeYears" });
  const boundaries = useWatch({ control, name: "boundaries" });
  const dimensions = useWatch({ control, name: "dimensions" });
  const ownerNameValue = useWatch({ control, name: "titleDeed.ownerName" });
  const tehsilValue = useWatch({
    control,
    name: "siteAddress.tehsilForCircleRates",
  }) as string | undefined;
  const mohallaValue = useWatch({ control, name: "siteAddress.mohalla" }) as
    | string
    | undefined;
  const roadWidthMetersValue = Number(
    useWatch({ control, name: "siteAddress.roadWidthMeters" }) ?? 0,
  );

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
    const row =
      (section === "boundaries" ? boundaries : dimensions)?.[direction] ?? {};
    const site = String(row.asPerSite ?? "");
    const previousDocs = String(row.asPerDocs ?? "");

    if (site === "" || site === previousDocs) {
      form.setValue(`${section}.${direction}.asPerSite`, raw, {
        shouldDirty: true,
      });
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
        tehsil:
          String(data.siteAddress.tehsilForCircleRates ?? "") || undefined,
        // Likewise the circle-rate register's own keys — kept in the site
        // address block for editing, extracted here for the rate lookup.
        circleRateMohalla:
          String(data.siteAddress.mohalla ?? "") || undefined,
        roadWidthMeters:
          Number(data.siteAddress.roadWidthMeters) || undefined,
        dimensionUnit: data.dimensionUnit,
        areaUnit: data.areaUnit,
        // Only a Flat is entered by hand; a Shop is derived and anything else
        // has no share to state, both of which the backend resolves.
        undividedShareOfLand: Number(data.undividedShareOfLand) || undefined,
        documentsReceived: data.documentsReceived || undefined,
        gpsCoordinates: data.gpsCoordinates || undefined,
        briefDescription: data.briefDescription || undefined,
        areaAsPerDeed: Number(data.areaAsPerDeed) || undefined,
        areaAsPerSite: Number(data.areaAsPerSite) || undefined,
        advanceReceived: Number(data.advanceReceived) || undefined,
        assetsSoldAsPerDeed: data.assetsSoldAsPerDeed || undefined,
        tenure: data.tenure || undefined,
        // The backend drops this when tenure is Freehold.
        leaseDetails:
          data.tenure === "Leasehold" ? data.leaseDetails : undefined,
        land: {
          prevailingMarketRate: Number(data.prevailingMarketRate) || 0,
          circleRate: Number(data.circleRate) || 0,
          adoptedRate: Number(data.adoptedRate) || 0,
          plotPosition: data.plotPosition || "Intermittent Plot",
          superAreaPercent: (Number(data.superAreaPercent) || 0) / 100,
        },
        // Omitted (not sent as zeros) until a year is entered — both schemas
        // treat `building` as an all-or-nothing section, and yearOfConstruction
        // is required *within* it, so a zeroed placeholder fails validation
        // instead of just deferring the section like every other draft field.
        building: data.yearOfConstruction
          ? {
              yearOfConstruction: Number(data.yearOfConstruction),
              expectedLifeYears: Number(data.expectedLifeYears) || 80,
              floors: data.floors.map((floor) => ({
                ...floor,
                coveredAreaSqM: Number(floor.coveredAreaSqM) || 0,
                replacementRate: Number(floor.replacementRate) || 0,
              })),
            }
          : undefined,
        titleDeed: data.titleDeed,
        siteAddress: data.siteAddress,
        discrepancy: data.discrepancy,
        boundaries: data.boundaries,
        dimensions: data.dimensions,
        buildingSpecs: data.buildingSpecs,
        generalDetails: data.generalDetails,
        rooms: data.rooms,
        floorDetails: data.floorDetails,
        engineerNotes: data.engineerNotes || undefined,
      },
    });
  };

  const ownerName = String(ownerNameValue ?? "") || "Untitled draft";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSave)}
        className="flex flex-col gap-5"
      >
        <ValuationEditorHeader
          valuation={valuation}
          ownerName={ownerName}
          readOnly={readOnly}
          onRecalculate={() => recalcMutation.mutate(id)}
          isRecalculating={recalcMutation.isPending}
          onDownload={() => downloadMutation.mutate({ id })}
          isDownloading={downloadMutation.isPending}
          isSaving={updateMutation.isPending}
          onSubmit={() => submitMutation.mutate(id)}
          isSubmitting={submitMutation.isPending}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Tabs defaultValue="property">
            <TabsList className="flex-wrap">
              <TabsTrigger value="property">Property &amp; Title</TabsTrigger>
              <TabsTrigger value="address">
                Address &amp; Boundaries
              </TabsTrigger>
              <TabsTrigger value="rates">Rates &amp; Building</TabsTrigger>
              <TabsTrigger value="specs">Floor Specifications</TabsTrigger>
              <TabsTrigger value="general">General Details</TabsTrigger>
              <TabsTrigger value="photos">Site Photos</TabsTrigger>
            </TabsList>

            <PropertyTitleTab
              control={control}
              options={options}
              disabled={readOnly}
              isLeasehold={isLeasehold}
              gpsCoordinatesValue={gpsCoordinatesValue ?? ""}
            />

            <AddressBoundariesTab
              control={control}
              options={options}
              disabled={readOnly}
              dimensionUnit={dimensionUnit}
              onMirrorDocsToSite={mirrorDocsToSite}
            />

            <RatesBuildingTab
              control={control}
              options={options}
              disabled={readOnly}
              isPlot={isPlot}
              method={method}
              tehsilValue={tehsilValue ?? ""}
              mohallaValue={mohallaValue ?? ""}
              roadWidthMetersValue={roadWidthMetersValue}
              onUseCircleRate={(rate) =>
                form.setValue("circleRate", String(rate), { shouldDirty: true })
              }
              yearOfConstruction={yearOfConstruction}
              expectedLifeYears={expectedLifeYears}
              reportYear={Number(reportYear) || new Date().getFullYear()}
              coveredAreaConsideration={coveredAreaConsideration}
              onCascadeYearOfConstruction={(raw) =>
                cascadeBuildingDefault("yearOfConstruction", yearOfConstruction, raw)
              }
              onCascadeExpectedLifeYears={(raw) =>
                cascadeBuildingDefault("expectedLifeYears", expectedLifeYears, raw)
              }
            />

            <FloorSpecificationsTab
              control={control}
              options={options}
              disabled={readOnly || isPlot}
            />

            <GeneralDetailsTab
              control={control}
              options={options}
              disabled={readOnly}
              roomsSummary={roomsSummary}
              valuation={valuation}
              reviewForm={reviewForm}
              isReviewPending={reviewMutation.isPending}
              onApproveReview={() =>
                reviewMutation.mutate({
                  id,
                  data: {
                    decision: "approved",
                    notes: reviewForm.getValues("notes"),
                  },
                })
              }
              onRejectReview={() =>
                reviewMutation.mutate({
                  id,
                  data: {
                    decision: "rejected",
                    notes: reviewForm.getValues("notes"),
                  },
                })
              }
            />

            <SitePhotosTab valuationId={id} disabled={readOnly} />
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
