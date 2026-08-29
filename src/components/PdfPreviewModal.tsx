import { Button } from "@/components/ui/button";
import { Modal } from "@/components/Modal";
import { IconDownload } from "@tabler/icons-react";

interface PdfPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Object URL for the fetched blob; undefined while still loading. */
  url: string | undefined;
  filename: string;
  isLoading: boolean;
}

/** Renders a fetched PDF blob inline via the browser's native PDF viewer, with a download action alongside. */
export function PdfPreviewModal({
  open,
  onOpenChange,
  title,
  url,
  filename,
  isLoading,
}: PdfPreviewModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      className="max-w-4xl"
      footer={
        <Button asChild variant="outline" disabled={!url}>
          <a href={url} download={filename}>
            <IconDownload className="mr-1 size-4" />
            Download
          </a>
        </Button>
      }
    >
      {url ? (
        <iframe src={url} title={title} className="h-[75vh] w-full rounded border" />
      ) : (
        <div className="flex h-[75vh] w-full items-center justify-center text-sm text-muted-foreground">
          {isLoading ? "Rendering…" : "Unable to load the preview."}
        </div>
      )}
    </Modal>
  );
}
