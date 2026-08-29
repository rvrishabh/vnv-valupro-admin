import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { FloorSpecsEditor } from "@/components/Valuation/FloorSpecsEditor";
import type { FormState } from "@/components/Valuation/valuation-form.utils";
import type { ValuationOptions } from "@/types";
import type { Control } from "react-hook-form";

export function FloorSpecificationsTab({
  control,
  options,
  disabled,
}: {
  control: Control<FormState>;
  options?: ValuationOptions;
  disabled: boolean;
}) {
  return (
    <TabsContent value="specs" className="mt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Specifications &amp; Covered Area Rates — per floor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FloorSpecsEditor control={control} options={options} disabled={disabled} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
