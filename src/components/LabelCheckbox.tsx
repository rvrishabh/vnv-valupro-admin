import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface LabelCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function LabelCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: LabelCheckboxProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Label
        htmlFor={id}
        className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="peer h-5 w-5 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
    </div>
  );
}
