import {
  useDeleteValuationPhotoMutation,
  useSetPhotoIncludedMutation,
} from "@/api/mutations/valuation-photos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ValuationPhotoMeta } from "@/types";
import { IconCheck, IconTrash } from "@tabler/icons-react";

/**
 * R2 objects are public, so the photo's own URL goes straight into <img src>
 * — no auth-gated fetch needed.
 *
 * `selectable` shows the include/exclude control — only meaningful for
 * SITE_VISIT photos, where an engineer may upload far more than the report
 * can use and the admin picks which ones go in.
 */
export function PhotoThumb({
  valuationId,
  photo,
  disabled,
  selectable = false,
  aspectClassName = "aspect-square",
}: {
  valuationId: string;
  photo: ValuationPhotoMeta;
  disabled?: boolean;
  selectable?: boolean;
  aspectClassName?: string;
}) {
  const deletePhoto = useDeleteValuationPhotoMutation();
  const setIncluded = useSetPhotoIncludedMutation();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border bg-muted",
        aspectClassName,
        selectable && photo.includeInReport && "ring-2 ring-primary",
      )}
    >
      {selectable ? (
        // The whole image is the toggle target — corner badges are too small
        // to hit reliably once the grid packs five-plus thumbs to a row.
        <button
          type="button"
          disabled={disabled || setIncluded.isPending}
          onClick={() =>
            setIncluded.mutate({
              valuationId,
              photoId: photo.id,
              includeInReport: !photo.includeInReport,
            })
          }
          className="block h-full w-full"
          title={
            photo.includeInReport
              ? "Included in report — click to remove"
              : "Not in report — click to include"
          }
        >
          <img
            src={photo.url}
            alt=""
            className={cn(
              "h-full w-full object-cover",
              !photo.includeInReport && "opacity-50",
            )}
          />
        </button>
      ) : (
        <img src={photo.url} alt="" className="h-full w-full object-cover" />
      )}
      {selectable ? (
        <div
          className={cn(
            "pointer-events-none absolute left-1 top-1 flex size-5 items-center justify-center rounded-full border text-white shadow",
            photo.includeInReport
              ? "border-primary bg-primary"
              : "border-white/80 bg-black/30",
          )}
        >
          {photo.includeInReport ? <IconCheck className="size-3.5" /> : null}
        </div>
      ) : null}
      {!disabled ? (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute bottom-1 right-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => deletePhoto.mutate({ valuationId, photoId: photo.id })}
          disabled={deletePhoto.isPending}
        >
          <IconTrash className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
