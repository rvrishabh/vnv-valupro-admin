import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** A generic card-shaped placeholder — a title bar plus a few content lines. */
function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Matches the shape shared by the case-detail and valuation-editor pages:
 * a header (title + one action), a row of tabs, then a main column plus a
 * narrower sidebar of stacked cards — so the layout doesn't jump once the
 * real content lands.
 */
export function DetailPageSkeleton({
  gridColsClassName = "lg:grid-cols-[minmax(0,1fr)_320px]",
  tabCount = 4,
}: {
  gridColsClassName?: string;
  tabCount?: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: tabCount }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28" />
        ))}
      </div>

      <div className={cn("grid gap-5", gridColsClassName)}>
        <CardSkeleton lines={6} />
        <div className="flex flex-col gap-4">
          <CardSkeleton lines={3} />
          <CardSkeleton lines={3} />
        </div>
      </div>
    </div>
  );
}
