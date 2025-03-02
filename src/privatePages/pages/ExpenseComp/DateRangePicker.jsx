"use client";

import React, { useState, useEffect } from "react";
import { format, getYear, setYear, isAfter, isBefore } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DatePickerWithRange = ({ className, value, onChange }) => {
  const [fromMonthDate, setFromMonthDate] = useState(value?.from || new Date());
  const [toMonthDate, setToMonthDate] = useState(value?.to || new Date());
  const [isFromPopoverOpen, setIsFromPopoverOpen] = useState(false); // State for "From" popover
  const [isToPopoverOpen, setIsToPopoverOpen] = useState(false); // State for "To" popover

  useEffect(() => {
    if (value?.from) {
      setFromMonthDate(value.from);
    }
    if (value?.to) {
      setToMonthDate(value.to);
    }
  }, [value?.from, value?.to]);

  const currentYear = getYear(new Date());
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleYearChange = (date, setDate) => (year) => {
    const newDate = setYear(date, parseInt(year));
    setDate(newDate);
  };

  const handleFromDateChange = (date) => {
    if (date) {
      if (value?.to && isAfter(date, value.to)) {
        onChange({ from: date, to: date });
      } else {
        onChange({ ...value, from: date });
      }
    }
  };

  const handleToDateChange = (date) => {
    if (date) {
      if (value?.from && isBefore(date, value.from)) {
        onChange({ from: date, to: date });
      } else {
        onChange({ ...value, to: date });
      }
    }
  };

  const handleClearFromDate = () => {
    onChange({ ...value, from: null }); // Clear the "From" date
    setIsFromPopoverOpen(false); // Close the "From" popover
  };

  const handleClearToDate = () => {
    onChange({ ...value, to: null }); // Clear the "To" date
    setIsToPopoverOpen(false); // Close the "To" popover
  };

  const MonthYearSelect = ({ date, setDate }) => (
    <div className="flex items-center justify-center space-x-2">
      <Select
        value={format(date, "MMMM")}
        onValueChange={(month) => {
          const newDate = new Date(date);
          newDate.setMonth(new Date(`${month} 1`).getMonth());
          setDate(newDate);
        }}
      >
        <SelectTrigger className="h-8 w-[120px]">
          <SelectValue>{format(date, "MMMM")}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto bg-white">
          {Array.from({ length: 12 }, (_, i) =>
            new Date(0, i).toLocaleString("default", { month: "long" })
          ).map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={getYear(date).toString()}
        onValueChange={handleYearChange(date, setDate)}
      >
        <SelectTrigger className="h-8 w-[100px]">
          <SelectValue>{getYear(date)}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto bg-white">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      {/* From Date Picker */}
      <div className="flex-1">
        <Popover open={isFromPopoverOpen} onOpenChange={setIsFromPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal hover:bg-gray-100 transition-colors duration-200 group"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 group-hover:text-gray-700" />
              <span className="truncate">
                {value?.from ? format(value.from, "MMM d, yyyy") : "From"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-white rounded-lg shadow-lg border border-gray-200"
            align="end"
            sideOffset={12}
          >
            <div className="px-4 py-2 border-b">
              <MonthYearSelect
                date={fromMonthDate}
                setDate={setFromMonthDate}
              />
            </div>
            <Calendar
              initialFocus
              mode="single"
              selected={value?.from}
              onSelect={handleFromDateChange}
              defaultMonth={fromMonthDate}
              month={fromMonthDate}
              disabled={(date) => value?.to && isAfter(date, value.to)}
              className="border-none"
              classNames={{
                day: "text-sm h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 rounded-full transition-colors duration-200",
                day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                day_today: "border border-blue-600",
                day_outside:
                  "text-gray-400 opacity-50 aria-disabled:opacity-25",
                month: "space-y-4",
                nav_button: "hidden",
                nav: "hidden",
              }}
              components={{
                IconLeft: () => null,
                IconRight: () => null,
              }}
            />
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                className="w-full text-sm text-red-600 hover:bg-red-50"
                onClick={handleClearFromDate} // Use the new handler
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* To Date Picker */}
      <div className="flex-1">
        <Popover open={isToPopoverOpen} onOpenChange={setIsToPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal hover:bg-gray-100 transition-colors duration-200 group"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 group-hover:text-gray-700" />
              <span className="truncate">
                {value?.to ? format(value.to, "MMM d, yyyy") : "To"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-white rounded-lg shadow-lg border border-gray-200"
            align="end"
            sideOffset={5}
          >
            <div className="px-4 py-2 border-b">
              <MonthYearSelect date={toMonthDate} setDate={setToMonthDate} />
            </div>
            <Calendar
              initialFocus
              mode="single"
              selected={value?.to}
              onSelect={handleToDateChange}
              defaultMonth={toMonthDate}
              month={toMonthDate}
              disabled={(date) => value?.from && isBefore(date, value.from)}
              className="border-none"
              classNames={{
                day: "text-sm h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 rounded-full transition-colors duration-200",
                day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                day_today: "border border-blue-600",
                day_outside:
                  "text-gray-400 opacity-50 aria-disabled:opacity-25",
                month: "space-y-4",
                nav_button: "hidden",
                nav: "hidden",
              }}
              components={{
                IconLeft: () => null,
                IconRight: () => null,
              }}
            />
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                className="w-full text-sm text-red-600 hover:bg-red-50"
                onClick={handleClearToDate} // Use the new handler
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DatePickerWithRange;
