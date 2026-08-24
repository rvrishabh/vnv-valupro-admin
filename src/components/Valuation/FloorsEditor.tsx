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

export function emptyFloor(index: number): FloorInput {
  return {
    name: FLOOR_NAMES[index] ?? `Floor ${index}`,
    coveredAreaSqM: 0,
    replacementRate: 0,
    roofType: "RCC",
    constructionCategory: 1,
  };
}

export function FloorsEditor({
  floors,
  onChange,
  disabled,
}: {
  floors: FloorInput[];
  onChange: (floors: FloorInput[]) => void;
  disabled?: boolean;
}) {
  const update = (index: number, patch: Partial<FloorInput>) => {
    onChange(floors.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1.1fr_auto] items-center gap-3 text-xs font-medium text-muted-foreground">
        <span>Floor</span>
        <span>Covered area (Sq.m)</span>
        <span>Replacement rate (₹/Sq.m)</span>
        <span>Roof type</span>
        <span />
      </div>

      {floors.map((floor, index) => (
        <div
          key={index}
          className="grid grid-cols-[1.4fr_1fr_1fr_1.1fr_auto] items-center gap-3"
        >
          <Input
            value={floor.name}
            disabled={disabled}
            onChange={(e) => update(index, { name: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            value={floor.coveredAreaSqM === 0 ? "" : floor.coveredAreaSqM}
            disabled={disabled}
            onChange={(e) =>
              update(index, { coveredAreaSqM: Number(e.target.value) || 0 })
            }
          />
          <Input
            type="number"
            step="1"
            min="0"
            value={floor.replacementRate === 0 ? "" : floor.replacementRate}
            disabled={disabled}
            onChange={(e) =>
              update(index, { replacementRate: Number(e.target.value) || 0 })
            }
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
      ))}

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || floors.length >= FLOOR_NAMES.length}
          onClick={() => onChange([...floors, emptyFloor(floors.length)])}
        >
          <IconPlus className="mr-1 size-4" />
          Add floor
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Only floors with a covered area above zero are valued. Age and
          depreciation are derived from the year of construction.
        </p>
      </div>
    </div>
  );
}

export { FLOOR_NAMES };
