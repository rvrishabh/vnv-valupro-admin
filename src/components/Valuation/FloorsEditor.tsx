import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FloorInput, RoofType } from "@/types";
import { IconPlus, IconTrash } from "@tabler/icons-react";

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
  floor: FloorInput,
  buildingYear: number,
  buildingLife: number,
  reportYear: number,
) {
  const year = floor.yearOfConstruction ?? buildingYear;
  const life = floor.expectedLifeYears ?? buildingLife;
  const age = year > 0 ? Math.max(0, reportYear - year) : 0;
  const depreciationPercent = life > 0 ? (age / life) * DEPRECIABLE_FRACTION : 0;

  return { year, life, age, depreciationPercent, residualAge: life - age };
}

export function FloorsEditor({
  floors,
  onChange,
  disabled,
  buildingYear = 0,
  buildingLife = 80,
  reportYear = new Date().getFullYear(),
}: {
  floors: FloorInput[];
  onChange: (floors: FloorInput[]) => void;
  disabled?: boolean;
  buildingYear?: number;
  buildingLife?: number;
  reportYear?: number;
}) {
  const update = (index: number, patch: Partial<FloorInput>) => {
    onChange(floors.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const columns =
    "grid-cols-[1.2fr_0.9fr_1fr_1fr_0.8fr_0.9fr_1.3fr_auto]";

  return (
    <div className="flex flex-col gap-3 overflow-x-auto">
      <div className={`grid ${columns} min-w-[900px] items-end gap-3 text-xs font-medium text-muted-foreground`}>
        <span>Floor</span>
        <span>Covered area (Sq.m)</span>
        <span>Replacement rate (₹/Sq.m)</span>
        <span>Roof type</span>
        <span>Year built</span>
        <span>Total life (yrs)</span>
        <span>Age &amp; depreciation</span>
        <span />
      </div>

      {floors.map((floor, index) => {
        const { year, life, age, depreciationPercent, residualAge } = derive(
          floor,
          buildingYear,
          buildingLife,
          reportYear,
        );
        // Flagged only when this floor departs from the building default, so
        // an intentional override stands out in a long list of floors.
        const matchesBuilding =
          floor.yearOfConstruction === undefined ||
          floor.yearOfConstruction === buildingYear;

        return (
          <div key={index} className={`grid ${columns} min-w-[900px] items-center gap-3`}>
            <Input
              value={floor.name}
              disabled={disabled}
              onChange={(e) => update(index, { name: e.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              value={floor.coveredAreaSqM}
              disabled={disabled}
              onChange={(e) => update(index, { coveredAreaSqM: Number(e.target.value) })}
            />
            <Input
              type="number"
              step="1"
              min="0"
              value={floor.replacementRate}
              disabled={disabled}
              onChange={(e) => update(index, { replacementRate: Number(e.target.value) })}
            />
            <Select
              value={floor.roofType}
              disabled={disabled}
              onValueChange={(value) => update(index, { roofType: value as RoofType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOF_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Pre-filled from the building's year; change it here when this
                floor was added later, so it depreciates on its own age. */}
            <Input
              type="number"
              step="1"
              min="1800"
              placeholder={buildingYear ? String(buildingYear) : "Year"}
              value={floor.yearOfConstruction ?? ""}
              disabled={disabled}
              onChange={(e) =>
                update(index, {
                  yearOfConstruction: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <Input
              type="number"
              step="1"
              min="1"
              placeholder={String(buildingLife)}
              value={floor.expectedLifeYears ?? ""}
              disabled={disabled}
              onChange={(e) =>
                update(index, {
                  expectedLifeYears: e.target.value ? Number(e.target.value) : undefined,
                })
              }
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
              disabled={disabled || floors.length === 1}
              onClick={() => onChange(floors.filter((_, i) => i !== index))}
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
          disabled={disabled || floors.length >= FLOOR_NAMES.length}
          onClick={() =>
            onChange([
              ...floors,
              emptyFloor(floors.length, {
                yearOfConstruction: buildingYear || undefined,
                expectedLifeYears: buildingLife || undefined,
              }),
            ])
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
