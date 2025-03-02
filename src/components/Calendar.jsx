import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Calendar = ({ onDone, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const previousMonthDays = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).getDate();

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const handleDone = () => {
    if (selectedDate) {
      const selectedFullDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        selectedDate
      );
      onDone?.(selectedFullDate);
    }
  };

  const handleCancel = () => {
    onClose?.();
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value);
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
  };

  const renderDays = () => {
    const days = [];
    const paddingDays = (firstDayOfMonth + 6) % 7;

    // Previous month days (disabled)
    for (let i = paddingDays - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="text-gray-300 text-sm">
          {previousMonthDays - i}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate;
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`cursor-pointer text-center p-1 rounded-full text-sm transition-colors
            ${isSelected ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`}
        >
          {day}
        </div>
      );
    }

    // Next month days (disabled)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <div key={`next-${i}`} className="text-gray-300 text-sm">
          {i}
        </div>
      );
    }

    return days;
  };

  // Get the current year and month
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Generate the next 5 years
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  // Generate the next 12 months
  const months = Array.from({ length: 12 }, (_, i) => (currentMonth + i) % 12);

  // Check if the current view is the current month
  const isCurrentMonth =
    currentDate.getFullYear() === currentYear &&
    currentDate.getMonth() === currentMonth;

  // Check if the current view is the 12th month in the future
  const isFutureLimit =
    currentDate.getFullYear() ===
      currentYear + Math.floor((currentMonth + 11) / 12) &&
    currentDate.getMonth() === (currentMonth + 11) % 12;

  return (
    <div className=" rounded-lg  p-4 w-[300px] relative">
      {/* Month and Year Selection */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          disabled={isCurrentMonth}
          className={`p-1 rounded-full hover:bg-gray-100 ${
            isCurrentMonth ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <select
            value={currentDate.getMonth()}
            onChange={handleMonthChange}
            className="p-1 rounded border border-gray-200 text-sm"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {new Date(currentDate.getFullYear(), month).toLocaleString(
                  "default",
                  { month: "long" }
                )}
              </option>
            ))}
          </select>
          <select
            value={currentDate.getFullYear()}
            onChange={handleYearChange}
            className="p-1 rounded border border-gray-200 text-sm"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleNextMonth}
          disabled={isFutureLimit}
          className={`p-1 rounded-full hover:bg-gray-100 ${
            isFutureLimit ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-gray-500 text-xs">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2 mb-4">{renderDays()}</div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleDone}
          className="text-sm px-4 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default Calendar;
