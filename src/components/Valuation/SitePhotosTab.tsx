import { TabsContent } from "@/components/ui/tabs";
import { SitePhotosSection } from "@/components/Valuation/SitePhotosSection";

/** Photos tab — unchanged from before, still its own place in the tab bar. */
export function SitePhotosTab({
  valuationId,
  disabled,
}: {
  valuationId: string;
  disabled: boolean;
}) {
  return (
    <TabsContent value="photos" className="mt-4 flex flex-col gap-4">
      <SitePhotosSection valuationId={valuationId} disabled={disabled} />
    </TabsContent>
  );
}
