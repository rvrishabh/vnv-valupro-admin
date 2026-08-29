import FormDropdown from "@/components/Form/FormDropdown";
import FormInput from "@/components/Form/FormInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { AreaOfSite } from "@/components/Valuation/AreaOfSite";
import {
  DISCREPANCY_FIELDS,
  SITE_ADDRESS_FIELDS,
} from "@/components/Valuation/field-groups";
import { SectionFields } from "@/components/Valuation/SectionFields";
import {
  AREA_UNITS,
  BOUNDARY_GRID,
  DIMENSION_UNITS,
  DIRECTIONS,
  type FormState,
} from "@/components/Valuation/valuation-form.utils";
import type { Direction, ValuationOptions } from "@/types";
import type { Control } from "react-hook-form";

export function AddressBoundariesTab({
  control,
  options,
  disabled,
  dimensionUnit,
  onMirrorDocsToSite,
}: {
  control: Control<FormState>;
  options?: ValuationOptions;
  disabled: boolean;
  dimensionUnit: string;
  onMirrorDocsToSite: (
    section: "boundaries" | "dimensions",
    direction: Direction,
    raw: string,
  ) => void;
}) {
  return (
    <TabsContent value="address" className="mt-4 flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Address as per Site Visit</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionFields
            control={control}
            section="siteAddress"
            fields={SITE_ADDRESS_FIELDS}
            options={options}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Boundaries &amp; Dimensions</CardTitle>
          {/* Both columns are captured in the same unit, as the sheet
              does — the area below converts to Sq.m either way. */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Dimensions in</span>
              <FormDropdown
                control={control}
                name="dimensionUnit"
                options={DIMENSION_UNITS}
                allowClear={false}
                disabled={disabled}
                className="gap-0"
                triggerClassName="h-8 w-[90px]"
              />
            </div>
            {/* Areas carry their own unit (M-Doc!C92): a large plot is
                quoted in hectares while its sides are still measured
                in feet. */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Area in</span>
              <FormDropdown
                control={control}
                name="areaUnit"
                options={AREA_UNITS}
                allowClear={false}
                disabled={disabled}
                className="gap-0"
                triggerClassName="h-8 w-[90px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className={`grid ${BOUNDARY_GRID} gap-3 text-xs font-medium text-muted-foreground`}>
            <span>Direction</span>
            <span>As per documents</span>
            <span>As per site</span>
            <span>Dim. docs ({dimensionUnit})</span>
            <span>Dim. site ({dimensionUnit})</span>
          </div>

          {DIRECTIONS.map((direction) => (
            <div key={direction} className={`grid ${BOUNDARY_GRID} items-center gap-3`}>
              <span className="text-sm capitalize">{direction}</span>
              <FormInput
                control={control}
                name={`boundaries.${direction}.asPerDocs`}
                className="pb-0"
                disabled={disabled}
                onValueChange={(_next, raw) =>
                  onMirrorDocsToSite("boundaries", direction, raw)
                }
              />
              <FormInput
                control={control}
                name={`boundaries.${direction}.asPerSite`}
                className="pb-0"
                disabled={disabled}
              />
              <FormInput
                control={control}
                name={`dimensions.${direction}.asPerDocs`}
                className="pb-0"
                placeholder={dimensionUnit === "ft" ? "e.g. 30" : "e.g. 9.14"}
                disabled={disabled}
                onValueChange={(_next, raw) =>
                  onMirrorDocsToSite("dimensions", direction, raw)
                }
              />
              <FormInput
                control={control}
                name={`dimensions.${direction}.asPerSite`}
                className="pb-0"
                placeholder={dimensionUnit === "ft" ? "e.g. 30" : "e.g. 9.14"}
                disabled={disabled}
              />
            </div>
          ))}

          <p className="text-xs text-muted-foreground">
            The site columns copy the document columns as you type. Edit a
            site value directly when the visit found something different — it
            then stops following the deed.
          </p>
        </CardContent>
      </Card>

      <AreaOfSite control={control} disabled={disabled} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Discrepancy Check</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionFields
            control={control}
            section="discrepancy"
            fields={DISCREPANCY_FIELDS}
            options={options}
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
