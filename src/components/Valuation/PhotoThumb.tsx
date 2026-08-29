import { useDeleteValuationPhotoMutation } from "@/api/mutations/valuation-photos";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import type { ValuationPhotoMeta } from "@/types";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

/**
 * The photo endpoint sits behind the same httpOnly-cookie auth as the rest of
 * the API, so a plain `<img src="...">` can't load it directly — cookies are
 * not attached to cross-origin subresource requests the way they are to a
 * top-level navigation. Fetching through the authenticated axios client and
 * rendering the result as a blob object URL sidesteps that entirely.
 */
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
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const deletePhoto = useDeleteValuationPhotoMutation();

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;

    api
      .get<Blob>(`/valuations/${valuationId}/photos/${photo.id}/file`, {
        responseType: "blob",
      })
      .then((response) => {
        if (cancelled) return;
        url = URL.createObjectURL(response.data);
        setObjectUrl(url);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [valuationId, photo.id]);

  return (
    <div
      className={`group relative overflow-hidden rounded-md border bg-muted ${aspectClassName}`}
    >
      {objectUrl ? (
        <img
          src={objectUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          Loading…
        </div>
      )}
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
