import { useValuationQuery } from "@/api/queries/valuations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FLOOR_DETAIL_FIELDS,
  ROOM_FIELDS,
  SITE_ADDRESS_FIELDS,
  type FieldDef,
} from "@/components/Valuation/field-groups";
import { LocationMap } from "@/components/Valuation/LocationMap";
import { SitePhotosSection } from "@/components/Valuation/SitePhotosSection";
import { DIRECTIONS } from "@/components/Valuation/valuation-form.utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Case, Direction } from "@/types";

/** A labelled value in review mode — flags anything the engineer skipped. */
function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const display = value === undefined || value === null ? "" : String(value).trim();
  return (
    <div className="flex flex-col gap-0.5">
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
      {display ? (
        <span className="text-sm">{display}</span>
      ) : (
        <span className="text-sm italic text-destructive/70">Not filled</span>
      )}
    </div>
  );
}

function ReadOnlySection({
  section,
  fields,
  className,
}: {
  section: Record<string, unknown> | null | undefined;
  fields: FieldDef[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {fields.map((field) => (
        <ReadOnlyField
          key={field.key}
          label={field.label}
          value={section?.[field.key] as string | number | null | undefined}
        />
      ))}
    </div>
  );
}

/**
 * Everything the site engineer captures on the mobile app during the visit —
 * GPS, address, boundaries/dimensions as measured on site, room and floor
 * counts, the write-up, and the photos — gathered into one review-only tab
 * next to Overview and Valuation, so an admin can check at a glance what
 * came in and what's still missing without hunting through the valuation
 * form. Every value here is still edited from its own tab inside Valuation;
 * this is a read-only summary, not a second place to enter it.
 */
export function CaseSiteVisitTab({ record }: { record: Case }) {
  const valuationId = record.report?.id;
  const valuationQuery = useValuationQuery(valuationId);
  const valuation = valuationQuery.data;

  if (!valuationId) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">No valuation yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Site visit data will appear here once the valuation has started and
            the engineer has submitted from the mobile app.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (valuationQuery.isLoading || !valuation) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const boundaries = valuation.boundaries as
    | Record<Direction, { asPerSite?: string }>
    | null;
  const dimensions = valuation.dimensions as
    | Record<Direction, { asPerSite?: string }>
    | null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Site Visit Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Everything captured by the site engineer on the mobile app during
            the visit, gathered here so you can check what came in and what's
            still missing. Every field below is still edited from its own tab
            inside Valuation — this is a review copy, not a separate entry.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">GPS Location</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ReadOnlyField label="GPS co-ordinates" value={valuation.gpsCoordinates} />
          <LocationMap coordinates={valuation.gpsCoordinates ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Address as per Site Visit</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadOnlySection section={valuation.siteAddress} fields={SITE_ADDRESS_FIELDS} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Boundaries &amp; Dimensions (as per site)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-[80px_1fr_1fr] gap-3 text-xs font-medium text-muted-foreground">
            <span>Direction</span>
            <span>Boundary</span>
            <span>Dimension ({valuation.dimensionUnit || "ft"})</span>
          </div>
          {DIRECTIONS.map((direction) => (
            <div key={direction} className="grid grid-cols-[80px_1fr_1fr] items-baseline gap-3">
              <span className="text-sm capitalize">{direction}</span>
              <ReadOnlyField value={boundaries?.[direction]?.asPerSite} label="" />
              <ReadOnlyField value={dimensions?.[direction]?.asPerSite} label="" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">No. of Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadOnlySection
            section={valuation.rooms}
            fields={ROOM_FIELDS}
            className="sm:grid-cols-4"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Floor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadOnlySection section={valuation.floorDetails} fields={FLOOR_DETAIL_FIELDS} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Brief Description of Property based on Site Visit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReadOnlyField label="" value={valuation.briefDescription} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          <ReadOnlyField label="" value={valuation.engineerNotes} />
        </CardContent>
      </Card>

      <SitePhotosSection
        valuationId={valuationId}
        disabled={valuation.status === "APPROVED"}
        showSingleImageSections={false}
      />
    </div>
  );
}
