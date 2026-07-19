import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type MobileDateStripProps = {
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
};

const weekOptions = {
  weekStartsOn: 0,
} as const;

export function MobileDateStrip({
  selectedDate,
  onSelectedDateChange,
}: MobileDateStripProps) {
  const stripStart = startOfWeek(selectedDate, weekOptions);
  const stripEnd = endOfWeek(selectedDate, weekOptions);
  const days = eachDayOfInterval({
    start: stripStart,
    end: stripEnd,
  });

  return (
    <section className="rounded-lg border border-[#E4E7EC] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB]"
          aria-label="Previous week"
          onClick={() => onSelectedDateChange(subWeeks(selectedDate, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <h2 className="text-base font-semibold text-[#101828]">
          {format(selectedDate, "MMMM yyyy")}
        </h2>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB]"
          aria-label="Next week"
          onClick={() => onSelectedDateChange(addWeeks(selectedDate, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);

          return (
            <button
              type="button"
              key={day.toISOString()}
              className="flex min-h-14 flex-col items-center justify-center rounded-md text-sm transition-colors hover:bg-[#F9FAFB]"
              onClick={() => onSelectedDateChange(day)}
            >
              <span
                className={
                  isSelected
                    ? "text-xs font-semibold text-[#0355DD]"
                    : "text-xs font-medium text-[#667085]"
                }
              >
                {format(day, "EEEEE")}
              </span>

              <span
                className={
                  isSelected
                    ? "mt-2 flex size-8 items-center justify-center rounded-full bg-[#0355DD] font-semibold text-white"
                    : "mt-2 flex size-8 items-center justify-center rounded-full font-semibold text-[#101828]"
                }
              >
                {format(day, "d")}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
