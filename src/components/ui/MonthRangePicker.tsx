
import React from "react";
import { Calendar } from "lucide-react";
import { Input } from "./input";

interface MonthRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const MonthRangePicker: React.FC<MonthRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Select Month Range</label>
      <div className="flex gap-3 items-center">
        <div className="relative">
          <Input
            type="month"
            value={startDate.slice(0, 7)}
            onChange={(e) => onStartDateChange(`${e.target.value}-01`)}
            className="pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <span>To</span>
        <div className="relative">
          <Input
            type="month"
            value={endDate.slice(0, 7)}
            onChange={(e) => onEndDateChange(`${e.target.value}-01`)}
            className="pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default MonthRangePicker;
