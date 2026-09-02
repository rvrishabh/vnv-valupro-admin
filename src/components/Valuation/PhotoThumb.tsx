import { useDeleteValuationPhotoMutation } from "@/api/mutations/valuation-photos";
import { Button } from "@/components/ui/button";
import type { ValuationPhotoMeta } from "@/types";
import { IconTrash } from "@tabler/icons-react";

/** R2 objects are public, so the photo's own URL goes straight into <img src> — no auth-gated fetch needed. */
export function PhotoThumb({
  valuationId,
  photo,
  disabled,
  aspectClassName = "aspect-square",
}: {
  valuationId: string;
  photo: ValuationPhotoMeta;
  disabled?: boolean;
  aspectClassName?: string;
}) {
  const deletePhoto = useDeleteValuationPhotoMutation();

  return (
    <div
      className={`group relative overflow-hidden rounded-md border bg-muted ${aspectClassName}`}
    >
      <img src={photo.url} alt="" className="h-full w-full object-cover" />
      {!disabled ? (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute right-1 top-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => deletePhoto.mutate({ valuationId, photoId: photo.id })}
          disabled={deletePhoto.isPending}
        >
          <IconTrash className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
