
import React from "react";
import { Calendar } from "lucide-react";
import { Input } from "./input";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startLabel?: string;
  endLabel?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = "From",
  endLabel = "To",
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select Date Range</label>
      <div className="flex gap-3 items-center">
        <div className="relative">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <span>To</span>
        <div className="relative">
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
