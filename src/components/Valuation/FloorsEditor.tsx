import FormDropdown from "@/components/Form/FormDropdown";
import FormInput from "@/components/Form/FormInput";
import { Button } from "@/components/ui/button";
import type { FloorInput, RoofType, ValuationFormValues } from "@/types";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  type Control,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";

const ROOF_TYPES: RoofType[] = ["RCC", "RBC", "Girder Stone", "Tin Shed", "Kachcha"];

/** Floor order matches the workbook: index 0 is always the ground floor. */
const FLOOR_NAMES = [
  "Ground Floor",
  "I Floor",
  "II floor",
  "III Floor",
  "IV Floor",
  "V Floor",
  "VI Floor",
  "VII Floor",
  "VIII Floor",
];

/** Salvage value is taken as 10%, so only 90% of the asset depreciates. */
const DEPRECIABLE_FRACTION = 0.9;

export function emptyFloor(
  index: number,
  defaults?: { yearOfConstruction?: number; expectedLifeYears?: number },
): FloorInput {
  return {
    name: FLOOR_NAMES[index] ?? `Floor ${index}`,
    coveredAreaSqM: 0,
    actualAreaSqM: 0,
    replacementRate: 0,
    roofType: "RCC",
    constructionCategory: 1,
    // A new floor starts on the building's defaults, as E82 seeds from D82 in
    // the sheet; the valuer overrides it only if that floor was added later.
    yearOfConstruction: defaults?.yearOfConstruction || undefined,
    expectedLifeYears: defaults?.expectedLifeYears || undefined,
  };
}

/**
 * Mirrors the engine so the valuer sees age and depreciation update as they
 * type, without waiting for a save-and-recalculate round trip. The server
 * remains the source of truth for the figures that reach the report.
 */
function derive(
  floor: FloorInput | undefined,
  buildingYear: number,
  buildingLife: number,
  reportYear: number,
) {
  const year = floor?.yearOfConstruction ?? buildingYear;
  const life = floor?.expectedLifeYears ?? buildingLife;
  const age = year > 0 ? Math.max(0, reportYear - year) : 0;
  const depreciationPercent = life > 0 ? (age / life) * DEPRECIABLE_FRACTION : 0;

  return { year, life, age, depreciationPercent, residualAge: life - age };
}

const numberOrZero = (raw: string) => (raw === "" ? 0 : Number(raw));
const numberOrUndefined = (raw: string) => (raw === "" ? undefined : Number(raw));

const COLUMNS = "grid-cols-[1.1fr_0.9fr_0.9fr_1fr_0.9fr_0.8fr_0.8fr_1.2fr_auto]";

export function FloorsEditor({
  control,
  disabled,
  buildingYear = 0,
  buildingLife = 80,
  reportYear = new Date().getFullYear(),
  areaConsideration,
}: {
  control: Control<ValuationFormValues>;
  disabled?: boolean;
  buildingYear?: number;
  buildingLife?: number;
  reportYear?: number;
  /** M-Rate!C59 — "As per actual", "As per bye laws", ... */
  areaConsideration?: string;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "floors" });
  // Age and depreciation are derived as the valuer types, so this row-level
  // view of the array has to stay subscribed to its values.
  const floors = useWatch({ control, name: "floors" }) ?? [];
  const { setValue } = useFormContext<ValuationFormValues>();

  // M-Rate!E47 — "Area Considered As per actual". The heading follows the
  // "covered area under consideration" choice, so the column always says which
  // basis the valued area came from.
  const consideredLabel = `Area covered ${
    areaConsideration ? areaConsideration.toLowerCase() : "as per actual"
  } (Sq.m)`;

  return (
    <div className="flex flex-col gap-3 overflow-x-auto">
      <div
        className={`grid ${COLUMNS} min-w-[900px] items-end gap-3 text-xs font-medium text-muted-foreground`}
      >
        <span>Floor</span>
        <span>Actual area covered (Sq.m)</span>
        <span>{consideredLabel}</span>
        <span>Replacement rate (₹/Sq.m)</span>
        <span>Roof type</span>
        <span>Year built</span>
        <span>Total life (yrs)</span>
        <span>Age &amp; depreciation</span>
        <span />
      </div>

      {fields.map((field, index) => {
        const floor = floors[index];
        const { year, life, age, depreciationPercent, residualAge } = derive(
          floor,
          buildingYear,
          buildingLife,
          reportYear,
        );
        // Flagged only when this floor departs from the building default, so
        // an intentional override stands out in a long list of floors.
        const matchesBuilding =
          floor?.yearOfConstruction === undefined ||
          floor.yearOfConstruction === buildingYear;

        return (
          <div key={field.id} className={`grid ${COLUMNS} min-w-[900px] items-center gap-3`}>
            <FormInput
              control={control}
              name={`floors.${index}.name`}
              className="pb-0"
              disabled={disabled}
            />
            <FormInput
              control={control}
              name={`floors.${index}.actualAreaSqM`}
              className="pb-0"
              type="number"
              step="0.01"
              min="0"
              parseValue={numberOrZero}
              disabled={disabled}
              onValueChange={(next) => {
                // E49 = D49 in the sheet: the considered area follows the
                // measured one until a different basis is entered against it.
                const considered = floors[index]?.coveredAreaSqM;
                const previousActual = floors[index]?.actualAreaSqM;
                if (!considered || considered === previousActual) {
                  setValue(`floors.${index}.coveredAreaSqM`, Number(next) || 0, {
                    shouldDirty: true,
                  });
                }
              }}
            />
            <FormInput
              control={control}
              name={`floors.${index}.coveredAreaSqM`}
              className="pb-0"
              type="number"
              step="0.01"
              min="0"
              parseValue={numberOrZero}
              disabled={disabled}
            />
            <FormInput
              control={control}
              name={`floors.${index}.replacementRate`}
              className="pb-0"
              type="number"
              step="1"
              min="0"
              parseValue={numberOrZero}
              disabled={disabled}
            />
            <FormDropdown
              control={control}
              name={`floors.${index}.roofType`}
              options={ROOF_TYPES.map((type) => ({ label: type, value: type }))}
              allowClear={false}
              disabled={disabled}
            />

            {/* Pre-filled from the building's year; change it here when this
                floor was added later, so it depreciates on its own age. */}
            <FormInput
              control={control}
              name={`floors.${index}.yearOfConstruction`}
              className="pb-0"
              type="number"
              step="1"
              min="1800"
              placeholder={buildingYear ? String(buildingYear) : "Year"}
              parseValue={numberOrUndefined}
              disabled={disabled}
            />
            <FormInput
              control={control}
              name={`floors.${index}.expectedLifeYears`}
              className="pb-0"
              type="number"
              step="1"
              min="1"
              placeholder={String(buildingLife)}
              parseValue={numberOrUndefined}
              disabled={disabled}
            />

            <div className="flex flex-col text-xs">
              {year > 0 ? (
                <>
                  <span className="tabular-nums">
                    {age} yrs old · {(depreciationPercent * 100).toFixed(2)}% dep.
                  </span>
                  <span className="text-muted-foreground">
                    {residualAge} yrs residual of {life}
                    {matchesBuilding ? "" : " · overridden"}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">Set a year of construction</span>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || fields.length === 1}
              onClick={() => remove(index)}
            >
              <IconTrash className="size-4" />
            </Button>
          </div>
        );
      })}

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || fields.length >= FLOOR_NAMES.length}
          onClick={() =>
            append(
              emptyFloor(fields.length, {
                yearOfConstruction: buildingYear || undefined,
                expectedLifeYears: buildingLife || undefined,
              }),
            )
          }
        >
          <IconPlus className="mr-1 size-4" />
          Add floor
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Only floors with a covered area above zero are valued. “Year built”
          starts from the building's year of construction above — change it on a
          floor that was added later, and it depreciates on its own age.
        </p>
      </div>
    </div>
  );
}

export { FLOOR_NAMES };
