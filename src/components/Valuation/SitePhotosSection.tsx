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
import type { PhotoSection, ValuationPhotoMeta } from "@/types";
import { IconEye } from "@tabler/icons-react";
import { useState } from "react";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";
const MAX_SITE_VISIT_PHOTOS = 40;
const MAX_SELECTED_SITE_VISIT_PHOTOS = 10;

/**
 * A section that holds exactly one image — the aerial plan and the circle-rate
 * extract. Both replace on re-upload rather than accumulating, so the card
 * shows either the image with a "Replace" control or a single drop target.
 */
function SingleImageCard({
  title,
  photo,
  emptyHint,
  aspectClassName,
  valuationId,
  disabled,
  isUploading,
  onSelect,
}: {
  title: string;
  photo?: ValuationPhotoMeta;
  emptyHint: string;
  aspectClassName: string;
  valuationId: string;
  disabled: boolean;
  isUploading: boolean;
  onSelect: (files: FileList | null) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {photo ? (
          <div className="flex items-start gap-3">
            <div className="max-w-md flex-1">
              <PhotoThumb
                valuationId={valuationId}
                photo={photo}
                disabled={disabled}
                aspectClassName={aspectClassName}
              />
            </div>
            {!disabled ? (
              <ImageUploader
                shape="square"
                accept={ACCEPTED_TYPES}
                size="sm"
                label="Replace"
                disabled={isUploading}
                onImageChange={(e) => onSelect(e.target.files)}
              />
            ) : null}
          </div>
        ) : !disabled ? (
          <ImageUploader
            shape="square"
            accept={ACCEPTED_TYPES}
            className={`h-auto w-full max-w-md ${aspectClassName}`}
            label="Upload image"
            disabled={isUploading}
            onImageChange={(e) => onSelect(e.target.files)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{emptyHint}</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Site-visit and Google Earth photos for the Photograph & Location Annexure —
 * embedded inside the Site Visit tab, alongside the rest of what the engineer
 * captured on the visit.
 *
 * Uploads happen immediately on file selection rather than staying with the
 * form's Save Draft — a photo is either on the server or it isn't, there is
 * no half-entered state to hold locally, and re-uploading on every keystroke
 * autosave would be wasteful.
 */
export function SitePhotosSection({
  valuationId,
  disabled,
  showSingleImageSections = true,
}: {
  valuationId: string;
  disabled: boolean;
  /** The aerial plan and circle-rate scan aren't the engineer's photos — hide them on the Site Visit review tab, which only reviews what the engineer captured. */
  showSingleImageSections?: boolean;
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
  const circleRatePhoto = photos.find((p) => p.section === "CIRCLE_RATE");
  const selectedCount = sitePhotos.filter((p) => p.includeInReport).length;

  const handleFiles = (section: PhotoSection, fileList: FileList | null) => {
    if (!fileList?.length) return;
    uploadPhotos.mutate({ valuationId, section, files: Array.from(fileList) });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Report Photographs</CardTitle>
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
            The site-visit photos and the Google Earth image share one fixed A4
            page — always page 2 of the generated report. However many photos
            there are, and whatever mix of portrait and landscape, they resolve
            into justified rows with the aerial plan pinned below them. The
            circle-rate extract is a page of its own and closes the report.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Site Visit Photos
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {sitePhotos.length} uploaded · {selectedCount} / {MAX_SELECTED_SITE_VISIT_PHOTOS}{" "}
              selected for report
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sitePhotos.length ? (
            <p className="mb-3 text-xs text-muted-foreground">
              The site engineer may upload far more photos than a report needs —
              click a photo below to select or deselect it. Only selected
              photos appear in the annexure.
            </p>
          ) : null}
          {sitePhotos.length || !disabled ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {sitePhotos.map((photo) => (
                <PhotoThumb
                  key={photo.id}
                  valuationId={valuationId}
                  photo={photo}
                  disabled={disabled}
                  selectable
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

      {showSingleImageSections ? (
        <>
          <SingleImageCard
            title="Google Earth Image"
            photo={earthPhoto}
            emptyHint="No Google Earth screenshot uploaded yet — a single landscape image shown at the bottom of the annexure. Uploading a new one replaces it."
            aspectClassName="aspect-video"
            valuationId={valuationId}
            disabled={disabled}
            isUploading={uploadPhotos.isPending}
            onSelect={(files) => handleFiles("GOOGLE_EARTH", files)}
          />

          <SingleImageCard
            title="Circle Rate Extract"
            photo={circleRatePhoto}
            emptyHint="No circle-rate extract uploaded yet — a photo or scan of the government rate register page, with the applicable row highlighted. It becomes the final page of the report. Uploading a new one replaces it."
            aspectClassName="aspect-[3/4]"
            valuationId={valuationId}
            disabled={disabled}
            isUploading={uploadPhotos.isPending}
            onSelect={(files) => handleFiles("CIRCLE_RATE", files)}
          />
        </>
      ) : null}

      <PdfPreviewModal
        open={!!preview || previewAnnexure.isPending}
        onOpenChange={(open) => !open && closePreview()}
        title="Photograph & Location Annexure"
        url={preview?.url}
        filename={preview?.filename ?? `photo-annexure-${valuationId}.pdf`}
        isLoading={previewAnnexure.isPending}
      />
    </>
  );
}
