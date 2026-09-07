import FormInput from "@/components/Form/FormInput";
import { FormNumberInput } from "@/components/Form/FormNumberInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { CircleRateSuggestion } from "@/components/Valuation/CircleRateSuggestion";
import { CircleRateUpliftNote } from "@/components/Valuation/CircleRateUpliftNote";
import { BUILDING_SPEC_FIELDS } from "@/components/Valuation/field-groups";
import { FloorsEditor } from "@/components/Valuation/FloorsEditor";
import { OptionSelect } from "@/components/Valuation/OptionSelect";
import { FIELD_LABEL_CLASS, SectionFields } from "@/components/Valuation/SectionFields";
import type { FormState } from "@/components/Valuation/valuation-form.utils";
import type { ValuationMethod, ValuationOptions } from "@/types";
import type { Control } from "react-hook-form";

export function RatesBuildingTab({
  control,
  options,
  disabled,
  isPlot,
  method,
  tehsilValue,
  mohallaValue,
  roadWidthMetersValue,
  onUseCircleRate,
  yearOfConstruction,
  expectedLifeYears,
  reportYear,
  coveredAreaConsideration,
  onCascadeYearOfConstruction,
  onCascadeExpectedLifeYears,
}: {
  control: Control<FormState>;
  options?: ValuationOptions;
  disabled: boolean;
  isPlot: boolean;
  method: ValuationMethod;
  tehsilValue: string;
  mohallaValue: string;
  roadWidthMetersValue: number;
  onUseCircleRate: (rate: number) => void;
  yearOfConstruction: string;
  expectedLifeYears: string;
  reportYear: number;
  coveredAreaConsideration: string | undefined;
  onCascadeYearOfConstruction: (raw: string) => void;
  onCascadeExpectedLifeYears: (raw: string) => void;
}) {
  return (
    <TabsContent value="rates" className="mt-4 flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Land Rates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormNumberInput
            control={control}
            name="prevailingMarketRate"
            label="Prevailing market rate (₹/Sq.m)"
            labelClassName={FIELD_LABEL_CLASS}
            disabled={disabled}
          />
          <div className="flex flex-col gap-2 sm:col-span-2">
            <FormNumberInput
              control={control}
              name="circleRate"
              label="Guideline / circle rate (₹/Sq.m)"
              labelClassName={FIELD_LABEL_CLASS}
              disabled={disabled}
            />
            <CircleRateSuggestion
              tehsil={tehsilValue}
              mohalla={mohallaValue}
              roadWidthMeters={roadWidthMetersValue}
              method={method}
              disabled={disabled}
              onUse={onUseCircleRate}
            />
          </div>
          <FormNumberInput
            control={control}
            name="adoptedRate"
            label="Unit rate adopted (₹/Sq.m)"
            labelClassName={FIELD_LABEL_CLASS}
            disabled={disabled}
          />
          <div className="flex flex-col gap-1.5">
            <OptionSelect
              control={control}
              name="plotPosition"
              label="Corner plot or intermittent plot?"
              description="Corner and park-facing plots attract a circle-rate uplift."
              group="plotPosition"
              options={options}
              disabled={disabled}
            />
            <CircleRateUpliftNote control={control} tehsilValue={tehsilValue} />
          </div>
          <FormInput
            control={control}
            name="superAreaPercent"
            label="Extra for super area component (%)"
            labelClassName={FIELD_LABEL_CLASS}
            type="number"
            step="0.01"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Building Component</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              control={control}
              name="yearOfConstruction"
              label="Year of construction"
              labelClassName={FIELD_LABEL_CLASS}
              hint="Default for all floors; override per floor below."
              type="number"
              disabled={disabled}
              onValueChange={(_next, raw) => onCascadeYearOfConstruction(raw)}
            />
            <FormInput
              control={control}
              name="expectedLifeYears"
              label="Total estimated life (years)"
              labelClassName={FIELD_LABEL_CLASS}
              hint="Default for all floors; override per floor below."
              type="number"
              disabled={disabled}
              onValueChange={(_next, raw) => onCascadeExpectedLifeYears(raw)}
            />
            <OptionSelect
              control={control}
              name="buildingSpecs.totalFloors"
              label="Total no. of floors"
              group="totalFloors"
              options={options}
              disabled={disabled}
            />
            <OptionSelect
              control={control}
              name="buildingSpecs.coveredAreaConsideration"
              label="Covered area under consideration"
              group="coveredAreaConsideration"
              options={options}
              disabled={disabled}
            />
          </div>
          <FloorsEditor
            control={control}
            disabled={disabled || isPlot}
            buildingYear={Number(yearOfConstruction) || 0}
            buildingLife={Number(expectedLifeYears) || 80}
            reportYear={reportYear}
            areaConsideration={coveredAreaConsideration}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Building Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SectionFields
            control={control}
            section="buildingSpecs"
            fields={BUILDING_SPEC_FIELDS}
            options={options}
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
