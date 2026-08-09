import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface YearPickerProps {
  onYearChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export function YearPicker({ onYearChange, className }: YearPickerProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Generate years array (current year and 5 years back)
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    // Calculate start and end dates for selected year
    const startDate = new Date(selectedYear, 0, 1).toISOString(); // January 1st
    const endDate = new Date(
      selectedYear,
      11,
      31,
      23,
      59,
      59,
      999
    ).toISOString(); // December 31st

    onYearChange(startDate, endDate);
  }, [selectedYear]); // Removed onYearChange dependency

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <Select
        value={selectedYear.toString()}
        onValueChange={(value) => setSelectedYear(parseInt(value))}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
