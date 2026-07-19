import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CalendarProps = {
  selected?: Date;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  onSelect?: (date: Date) => void;
  className?: string;
};

function getCalendarDays(month: Date) {
  return eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });
}

function Calendar({
  selected,
  month,
  onMonthChange,
  onSelect,
  className,
}: CalendarProps) {
  const [uncontrolledMonth, setUncontrolledMonth] = React.useState(
    month ?? selected ?? new Date()
  );
  const visibleMonth = month ?? uncontrolledMonth;
  const calendarDays = React.useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth]
  );

  React.useEffect(() => {
    if (month) {
      setUncontrolledMonth(month);
    }
  }, [month]);

  const setVisibleMonth = (nextMonth: Date) => {
    setUncontrolledMonth(nextMonth);
    onMonthChange?.(nextMonth);
  };

  return (
    <div className={cn("w-[280px] p-3", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Previous month"
          className="text-[#344054] hover:bg-[#F9FAFB]"
          onClick={() => setVisibleMonth(subMonths(visibleMonth, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <p className="text-sm font-semibold text-[#101828]">
          {format(visibleMonth, "MMMM yyyy")}
        </p>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Next month"
          className="text-[#344054] hover:bg-[#F9FAFB]"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#667085]">
        {["S", "M", "T", "W", "T", "F", "S"].map((weekday, index) => (
          <span key={`${weekday}-${index}`} className="py-1">
            {weekday}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isMuted = !isSameMonth(day, visibleMonth);

          return (
            <button
              key={day.toISOString()}
              type="button"
              aria-pressed={isSelected}
              className={cn(
                "flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors outline-none hover:bg-[#F0F6FF] focus-visible:ring-3 focus-visible:ring-[#0355DD]/15",
                isMuted && "text-[#98A2B3]",
                isSelected
                  ? "bg-[#0355DD] text-white hover:bg-[#0248BD]"
                  : "text-[#344054]"
              )}
              onClick={() => onSelect?.(day)}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
