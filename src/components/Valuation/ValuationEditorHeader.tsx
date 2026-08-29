import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VALUATION_STATUS_VARIANT } from "@/lib/valuation-format";
import type { Valuation } from "@/types";
import { IconDownload, IconRefresh } from "@tabler/icons-react";

export function ValuationEditorHeader({
  valuation,
  ownerName,
  readOnly,
  onRecalculate,
  isRecalculating,
  onDownload,
  isDownloading,
  isSaving,
  onSubmit,
  isSubmitting,
}: {
  valuation: Valuation;
  ownerName: string;
  readOnly: boolean;
  onRecalculate: () => void;
  isRecalculating: boolean;
  onDownload: () => void;
  isDownloading: boolean;
  isSaving: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{ownerName}</h3>
        <Badge variant={VALUATION_STATUS_VARIANT[valuation.status] ?? "outline"}>
          {valuation.status}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onRecalculate}
          disabled={isRecalculating || readOnly}
        >
          <IconRefresh className="mr-1 size-4" />
          Recalculate
        </Button>
        <Button type="button" variant="outline" onClick={onDownload} disabled={isDownloading}>
          <IconDownload className="mr-1 size-4" />
          {isDownloading ? "Rendering…" : "Download PDF"}
        </Button>
        <Button type="submit" disabled={isSaving || readOnly}>
          {isSaving ? "Saving…" : "Save draft"}
        </Button>
        {valuation.status === "DRAFT" ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            Submit for review
          </Button>
        ) : null}
      </div>
    </div>
  );
}
