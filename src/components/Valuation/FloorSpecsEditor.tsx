import FormInput from "@/components/Form/FormInput";
import { Label } from "@/components/ui/label";
import type { ValuationFormValues, ValuationOptions } from "@/types";
import { type Control, type Path, useFormContext, useWatch } from "react-hook-form";
import { OptionSelect } from "./OptionSelect";

/**
 * Floorwise specifications — M-Rate rows 65-79. The workbook repeats this block
 * per floor across columns C/D/E; here it is one column per floor, driven by
 * the same option groups the sheet uses.
 */
const SPEC_ROWS: { key: string; label: string; group?: string }[] = [
  // Free text in the sheet, and printed as the first row of the report's
  // floorwise specification table ("RCC Framed").
  { key: "superstructure", label: "Superstructure" },
  { key: "walls", label: "Walls", group: "floor.walls" },
  { key: "partitions", label: "Partitions", group: "floor.partitions" },
  { key: "doors", label: "Doors", group: "floor.doors" },
  { key: "windows", label: "Windows", group: "floor.windows" },
  { key: "flooring", label: "Flooring", group: "floor.flooring" },
  { key: "specialFinish", label: "Special finish — marble, granite, wood panel etc." },
  { key: "finishing", label: "Finishing", group: "floor.finishing" },
  { key: "drainage", label: "Drainage" },
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

type FloorValues = ValuationFormValues["floors"][number];

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
  const { setValue } = useFormContext<ValuationFormValues>();

  // Only floors that actually exist are specified, matching the sheet, which
  // shows "N.A." for a floor with no covered area.
  const active: ActiveFloor[] = floors
    .map((floor, index) => ({ index, name: floor?.name ?? `Floor ${index}` , area: floor?.coveredAreaSqM ?? 0 }))
    .filter((floor) => floor.area > 0)
    .map(({ index, name }) => ({ index, name }));

  /**
   * The Ground Floor doubles as the default for every other floor's
   * specifications, so filling it in seeds the rest — the valuer only has to
   * touch a floor that genuinely differs. A floor already given its own
   * value is left alone, exactly like the building-level year/life cascade
   * in ValuationEditor.tsx: the *previous* Ground Floor value is compared,
   * not blindly overwritten, so a real per-floor override always sticks.
   */
  const cascadeFromGroundFloor = (
    getValue: (floor: FloorValues) => unknown,
    path: (index: number) => Path<ValuationFormValues>,
    previousValue: unknown,
    nextValue: unknown,
  ) => {
    floors.forEach((floor, index) => {
      if (index === 0) return;
      const current = getValue(floor);
      const wasFollowing = current === undefined || current === previousValue;
      if (wasFollowing) {
        setValue(path(index), nextValue as never, { shouldDirty: true });
      }
    });
  };

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
            active={active}
            floors={floors}
            options={options}
            disabled={disabled}
            cascadeFromGroundFloor={cascadeFromGroundFloor}
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
            onValueChange={
              floor.index === 0
                ? (next) =>
                    cascadeFromGroundFloor(
                      (f) => f.constructionCategory,
                      (i) => `floors.${i}.constructionCategory` as Path<ValuationFormValues>,
                      floors[0]?.constructionCategory,
                      next,
                    )
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

function FloorSpecRow({
  row,
  control,
  active,
  floors,
  options,
  disabled,
  cascadeFromGroundFloor,
}: {
  row: { key: string; label: string; group?: string };
  control: Control<ValuationFormValues>;
  active: ActiveFloor[];
  floors: ValuationFormValues["floors"];
  options?: ValuationOptions;
  disabled?: boolean;
  cascadeFromGroundFloor: (
    getValue: (floor: FloorValues) => unknown,
    path: (index: number) => Path<ValuationFormValues>,
    previousValue: unknown,
    nextValue: unknown,
  ) => void;
}) {
  const getSpecValue = (floor: FloorValues) => floor.specs?.[row.key];
  const specPath = (index: number) =>
    `floors.${index}.specs.${row.key}` as Path<ValuationFormValues>;

  return (
    <>
      <Label className="self-center text-xs text-muted-foreground">{row.label}</Label>
      {active.map((floor) => {
        const onValueChange =
          floor.index === 0
            ? (next: unknown) =>
                cascadeFromGroundFloor(getSpecValue, specPath, getSpecValue(floors[0]), next)
            : undefined;

        return row.group ? (
          <OptionSelect
            key={floor.index}
            control={control}
            name={specPath(floor.index)}
            group={row.group}
            options={options}
            disabled={disabled}
            onValueChange={onValueChange}
          />
        ) : (
          <FormInput
            key={floor.index}
            control={control}
            name={specPath(floor.index)}
            className="pb-0"
            disabled={disabled}
            onValueChange={onValueChange}
          />
        );
      })}
    </>
  );
}
