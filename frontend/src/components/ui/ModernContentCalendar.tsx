"use client";

import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { ScheduleRecord } from "@/lib/api/publishing";

interface ModernContentCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  schedulesByDay: Map<string, ScheduleRecord[]>;
  className?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function dayKey(date: Date): string {
  return date.toDateString();
}

export function ModernContentCalendar({
  selectedDate,
  onSelectDate,
  onDayClick,
  schedulesByDay,
  className = "",
}: ModernContentCalendarProps) {
  // Current viewing month/year in the calendar
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  // Sync viewed month when selectedDate changes from outside (e.g. from picker or suggestions)
  useEffect(() => {
    setCurrentMonthDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    );
  }, [selectedDate]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleString("default", {
    month: "long",
  });

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleTodayJump = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(today);
    if (onDayClick) onDayClick(today);
  };

  // Generate calendar grid days (42 cells = 6 weeks for consistency)
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      dayNumber: number;
    }> = [];

    // Previous month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dayNumber: d.getDate(),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    // Next month overflow days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dayNumber: i,
      });
    }

    return days;
  }, [year, month]);

  const today = new Date();

  const handleDaySelect = (dayDate: Date) => {
    onSelectDate(dayDate);
    if (onDayClick) {
      onDayClick(dayDate);
    }
  };

  return (
    <div
      className={`w-full select-none rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-5 sm:p-7 shadow-2xl backdrop-blur-md space-y-6 ${className}`}
    >
      {/* Calendar Top Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
          aria-label="Previous month"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {monthName} {year}
          </h3>
          <button
            type="button"
            onClick={handleTodayJump}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-amber-400 hover:bg-zinc-800 transition-colors"
          >
            Today
          </button>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
          aria-label="Next month"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Labels (Su Mo Tu We Th Fr Sa) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-xs font-semibold text-zinc-500 uppercase tracking-wider py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {calendarDays.map(({ date, isCurrentMonth, dayNumber }, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isSameDay(date, today);
          const daySchedules = schedulesByDay.get(dayKey(date)) || [];
          const hasSchedules = daySchedules.length > 0;
          const scheduleCount = daySchedules.length;

          // Decide styling based on scheduled state, selected state, and month
          let tileStyle = "";
          let textStyle = "";

          if (hasSchedules) {
            // White squircle badge with dark text for scheduled days (like Image 2)
            tileStyle = isSelected
              ? "bg-white text-zinc-950 font-bold rounded-2xl shadow-xl ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950 scale-[1.03]"
              : "bg-white text-zinc-950 font-bold rounded-2xl shadow-md hover:scale-[1.04] hover:shadow-lg";
            textStyle = "text-zinc-950 font-bold";
          } else if (isSelected) {
            // Dark charcoal squircle for selected empty day (like '10' in Image 2)
            tileStyle =
              "bg-zinc-800/90 text-white border border-zinc-700 rounded-2xl shadow-inner ring-1 ring-zinc-600 scale-[1.02]";
            textStyle = "text-white font-bold";
          } else if (isCurrentMonth) {
            // Normal current month day
            tileStyle =
              "bg-transparent text-zinc-200 hover:bg-zinc-800/70 hover:text-white rounded-2xl";
            textStyle = "text-zinc-200 font-medium";
          } else {
            // Other month overflow day
            tileStyle =
              "bg-transparent text-zinc-600 hover:bg-zinc-900/40 hover:text-zinc-400 rounded-2xl";
            textStyle = "text-zinc-600 font-normal";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDaySelect(date)}
              className={`relative h-11 sm:h-13 w-full flex flex-col items-center justify-center transition-all duration-200 group focus:outline-none ${tileStyle}`}
            >
              {/* Day Number */}
              <span className={`text-sm sm:text-base ${textStyle}`}>
                {dayNumber}
              </span>

              {/* Scheduled post indicator or Today indicator */}
              {hasSchedules ? (
                <div className="absolute bottom-1 flex items-center gap-0.5">
                  {scheduleCount === 1 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  ) : (
                    <span className="px-1 py-0.2 rounded-full bg-zinc-900 text-[8px] font-black text-amber-300 leading-none">
                      {scheduleCount}
                    </span>
                  )}
                </div>
              ) : isTodayDate ? (
                <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Calendar Bottom Legend & Summary */}
      <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-white border border-zinc-300" />
            <span className="text-[11px] text-zinc-300 font-medium">Scheduled Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-zinc-800 border border-zinc-700" />
            <span className="text-[11px] text-zinc-400">Selected Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] text-zinc-400">Today</span>
          </div>
        </div>

        <span className="text-[11px] font-mono text-zinc-500">
          Click any day to schedule or review
        </span>
      </div>
    </div>
  );
}
