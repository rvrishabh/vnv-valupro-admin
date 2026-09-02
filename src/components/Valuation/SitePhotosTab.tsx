import {
  usePreviewPhotoAnnexureMutation,
  useUploadValuationPhotosMutation,
} from "@/api/mutations/valuation-photos";
import { useValuationPhotosQuery } from "@/api/queries/valuation-photos";
import { PdfPreviewModal } from "@/components/PdfPreviewModal";
import ImageUploader from "@/components/Uploader/ImageUploader";
import { PhotoThumb } from "@/components/Valuation/PhotoThumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { IconEye } from "@tabler/icons-react";
import { useState } from "react";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";
const MAX_SITE_VISIT_PHOTOS = 10;

/**
 * Site-visit and Google Earth photos for the Photograph & Location Annexure.
 *
 * Uploads happen immediately on file selection rather than staying with the
 * form's Save Draft — a photo is either on the server or it isn't, there is
 * no half-entered state to hold locally, and re-uploading on every keystroke
 * autosave would be wasteful.
 */
export function SitePhotosTab({
  valuationId,
  disabled,
}: {
  valuationId: string;
  disabled: boolean;
}) {
  const photosQuery = useValuationPhotosQuery(valuationId);
  const uploadPhotos = useUploadValuationPhotosMutation();
  const previewAnnexure = usePreviewPhotoAnnexureMutation();

  const [preview, setPreview] = useState<{ url: string; filename: string } | null>(null);

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const photos = photosQuery.data ?? [];
  const sitePhotos = photos
    .filter((p) => p.section === "SITE_VISIT")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const earthPhoto = photos.find((p) => p.section === "GOOGLE_EARTH");

  const handleFiles = (
    section: "SITE_VISIT" | "GOOGLE_EARTH",
    fileList: FileList | null,
  ) => {
    if (!fileList?.length) return;
    uploadPhotos.mutate({ valuationId, section, files: Array.from(fileList) });
  };

  return (
    <TabsContent value="photos" className="mt-4 flex flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Photograph &amp; Location Annexure</CardTitle>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              previewAnnexure.mutate(
                { id: valuationId },
                { onSuccess: (data) => setPreview(data) },
              )
            }
            disabled={previewAnnexure.isPending}
          >
            <IconEye className="mr-1 size-4" />
            {previewAnnexure.isPending ? "Rendering…" : "Preview annexure PDF"}
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            The annexure is one fixed A4 page: the site-visit photos below always
            resolve into two rows — however many there are, and whatever mix of
            portrait or landscape — with the Google Earth image pinned at the
            bottom.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Site Visit Photos
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {sitePhotos.length} / {MAX_SITE_VISIT_PHOTOS}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sitePhotos.length || !disabled ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {sitePhotos.map((photo) => (
                <PhotoThumb
                  key={photo.id}
                  valuationId={valuationId}
                  photo={photo}
                  disabled={disabled}
                />
              ))}
              {!disabled && sitePhotos.length < MAX_SITE_VISIT_PHOTOS ? (
                <ImageUploader
                  shape="square"
                  multiple
                  accept={ACCEPTED_TYPES}
                  className="aspect-square h-auto w-full"
                  label="Upload photos"
                  disabled={uploadPhotos.isPending}
                  onImageChange={(e) => handleFiles("SITE_VISIT", e.target.files)}
                />
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No site-visit photos uploaded yet. JPEG, PNG or WEBP — export HEIC/iPhone
              photos as JPEG first.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Google Earth Image</CardTitle>
        </CardHeader>
        <CardContent>
          {earthPhoto ? (
            <div className="flex items-start gap-3">
              <div className="max-w-md flex-1">
                <PhotoThumb
                  valuationId={valuationId}
                  photo={earthPhoto}
                  disabled={disabled}
                  aspectClassName="aspect-video"
                />
              </div>
              {!disabled ? (
                <ImageUploader
                  shape="square"
                  accept={ACCEPTED_TYPES}
                  size="sm"
                  label="Replace"
                  disabled={uploadPhotos.isPending}
                  onImageChange={(e) => handleFiles("GOOGLE_EARTH", e.target.files)}
                />
              ) : null}
            </div>
          ) : !disabled ? (
            <ImageUploader
              shape="square"
              accept={ACCEPTED_TYPES}
              className="aspect-video h-auto w-full max-w-md"
              label="Upload image"
              disabled={uploadPhotos.isPending}
              onImageChange={(e) => handleFiles("GOOGLE_EARTH", e.target.files)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No Google Earth screenshot uploaded yet — a single landscape image
              shown at the bottom of the annexure. Uploading a new one replaces it.
            </p>
          )}
        </CardContent>
      </Card>

      <PdfPreviewModal
        open={!!preview || previewAnnexure.isPending}
        onOpenChange={(open) => !open && closePreview()}
        title="Photograph & Location Annexure"
        url={preview?.url}
        filename={preview?.filename ?? `photo-annexure-${valuationId}.pdf`}
        isLoading={previewAnnexure.isPending}
      />
    </TabsContent>
  );
}
