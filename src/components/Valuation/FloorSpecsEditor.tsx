import FormInput from "@/components/Form/FormInput";
import { Label } from "@/components/ui/label";
import type { ValuationFormValues, ValuationOptions } from "@/types";
import { type Control, useWatch } from "react-hook-form";
import { OptionSelect } from "./OptionSelect";

/**
 * Floorwise specifications — M-Rate rows 65-79. The workbook repeats this block
 * per floor across columns C/D/E; here it is one column per floor, driven by
 * the same option groups the sheet uses.
 */
const SPEC_ROWS: { key: string; label: string; group?: string }[] = [
  { key: "walls", label: "Walls", group: "floor.walls" },
  { key: "partitions", label: "Partitions", group: "floor.partitions" },
  { key: "doors", label: "Doors", group: "floor.doors" },
  { key: "windows", label: "Windows", group: "floor.windows" },
  { key: "flooring", label: "Flooring", group: "floor.flooring" },
  { key: "finishing", label: "Finishing", group: "floor.finishing" },
  { key: "ceiling", label: "Ceiling", group: "floor.ceiling" },
  { key: "roofingTerracing", label: "Roofing / terracing", group: "floor.roofingTerracing" },
  { key: "roofType", label: "Roof Type", group: "floor.roofType" },
  { key: "wiring", label: "Wiring — surface or conduit", group: "floor.wiring" },
  {
    key: "electricalFittings",
    label: "Class of electrical fittings",
    group: "floor.electricalFittings",
  },
  {
    key: "sanitaryInstallations",
    label: "Class of sanitary installations",
    group: "floor.sanitaryInstallations",
  },
  // Free text in the sheet ("3 m"), so it stays an input.
  { key: "heightOfFloor", label: "Height of floor (in m)" },
];

/** Column headers and field names both key off the floor's position in the array. */
interface ActiveFloor {
  index: number;
  name: string;
}

export function FloorSpecsEditor({
  control,
  options,
  disabled,
}: {
  control: Control<ValuationFormValues>;
  options?: ValuationOptions;
  disabled?: boolean;
}) {
  const floors = useWatch({ control, name: "floors" }) ?? [];

  // Only floors that actually exist are specified, matching the sheet, which
  // shows "N.A." for a floor with no covered area.
  const active: ActiveFloor[] = floors
    .map((floor, index) => ({ index, name: floor?.name ?? `Floor ${index}` , area: floor?.coveredAreaSqM ?? 0 }))
    .filter((floor) => floor.area > 0)
    .map(({ index, name }) => ({ index, name }));

  if (!active.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a floor with a covered area to specify its construction.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[640px] gap-x-4 gap-y-3"
        style={{ gridTemplateColumns: `220px repeat(${active.length}, minmax(180px, 1fr))` }}
      >
        <div />
        {active.map((floor) => (
          <Label key={floor.index} className="text-xs font-semibold">
            {floor.name}
          </Label>
        ))}

        {SPEC_ROWS.map((row) => (
          <FloorSpecRow
            key={row.key}
            row={row}
            control={control}
            floors={active}
            options={options}
            disabled={disabled}
          />
        ))}

        <Label className="text-xs text-muted-foreground">
          Category of construction
          <span className="block font-normal">1 = Good/Normal, 2 = Average</span>
        </Label>
        {active.map((floor) => (
          <OptionSelect
            key={floor.index}
            control={control}
            name={`floors.${floor.index}.constructionCategory`}
            group="floor.constructionCategory"
            options={options}
            disabled={disabled}
            allowEmpty={false}
            formatValue={(value) => String(value ?? 1)}
            parseValue={(value) => (Number(value) === 2 ? 2 : 1)}
          />
        ))}
      </div>
    </div>
  );
}

function FloorSpecRow({
  row,
  control,
  floors,
  options,
  disabled,
}: {
  row: { key: string; label: string; group?: string };
  control: Control<ValuationFormValues>;
  floors: ActiveFloor[];
  options?: ValuationOptions;
  disabled?: boolean;
}) {
  return (
    <>
      <Label className="self-center text-xs text-muted-foreground">{row.label}</Label>
      {floors.map((floor) =>
        row.group ? (
          <OptionSelect
            key={floor.index}
            control={control}
            name={`floors.${floor.index}.specs.${row.key}`}
            group={row.group}
            options={options}
            disabled={disabled}
          />
        ) : (
          <FormInput
            key={floor.index}
            control={control}
            name={`floors.${floor.index}.specs.${row.key}`}
            className="pb-0"
            disabled={disabled}
          />
        ),
      )}
    </>
  );
}
