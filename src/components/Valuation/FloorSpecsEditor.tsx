import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FloorInput, ValuationOptions } from "@/types";
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

export function FloorSpecsEditor({
  floors,
  options,
  onChange,
  disabled,
}: {
  floors: FloorInput[];
  options?: ValuationOptions;
  onChange: (floors: FloorInput[]) => void;
  disabled?: boolean;
}) {
  // Only floors that actually exist are specified, matching the sheet, which
  // shows "N.A." for a floor with no covered area.
  const active = floors.filter((f) => f.coveredAreaSqM > 0);

  const update = (name: string, key: string, value: string) =>
    onChange(
      floors.map((f) =>
        f.name === name ? { ...f, specs: { ...(f.specs ?? {}), [key]: value } } : f,
      ),
    );

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
          <Label key={floor.name} className="text-xs font-semibold">
            {floor.name}
          </Label>
        ))}

        {SPEC_ROWS.map((row) => (
          <FloorSpecRow
            key={row.key}
            row={row}
            floors={active}
            options={options}
            disabled={disabled}
            onChange={update}
          />
        ))}

        <Label className="text-xs text-muted-foreground">
          Category of construction
          <span className="block font-normal">1 = Good/Normal, 2 = Average</span>
        </Label>
        {active.map((floor) => (
          <OptionSelect
            key={`${floor.name}-category`}
            group="floor.constructionCategory"
            options={options}
            disabled={disabled}
            value={String(floor.constructionCategory ?? 1)}
            allowEmpty={false}
            onChange={(v) =>
              onChange(
                floors.map((f) =>
                  f.name === floor.name
                    ? { ...f, constructionCategory: Number(v) === 2 ? 2 : 1 }
                    : f,
                ),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function FloorSpecRow({
  row,
  floors,
  options,
  disabled,
  onChange,
}: {
  row: { key: string; label: string; group?: string };
  floors: FloorInput[];
  options?: ValuationOptions;
  disabled?: boolean;
  onChange: (name: string, key: string, value: string) => void;
}) {
  return (
    <>
      <Label className="self-center text-xs text-muted-foreground">{row.label}</Label>
      {floors.map((floor) => {
        const value = floor.specs?.[row.key] ?? "";
        return row.group ? (
          <OptionSelect
            key={`${floor.name}-${row.key}`}
            group={row.group}
            options={options}
            value={value}
            disabled={disabled}
            onChange={(v) => onChange(floor.name, row.key, v)}
          />
        ) : (
          <Input
            key={`${floor.name}-${row.key}`}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(floor.name, row.key, e.target.value)}
          />
        );
      })}
    </>
  );
}
