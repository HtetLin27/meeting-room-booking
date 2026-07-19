import {
  addWeeks,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfDay,
  subWeeks,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import type { Booking } from "@/api/booking.api";
import { Button } from "@/components/ui/button";
import {
  END_HOUR,
  getBookingColor,
  getCalendarBookingSegments,
  HOUR_HEIGHT,
  START_HOUR,
} from "@/lib/booking-utils";

type WeeklyCalendarProps = {
  bookings: Booking[];
  currentDate: Date;
  weekStart: Date;
  weekEnd: Date;
  onCurrentDateChange: (date: Date) => void;
};

const hours = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, index) => START_HOUR + index
);

export function WeeklyCalendar({
  bookings,
  currentDate,
  weekStart,
  weekEnd,
  onCurrentDateChange,
}: WeeklyCalendarProps) {
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });
  const segments = getCalendarBookingSegments(bookings, weekDays);
  const today = startOfDay(new Date());

  return (
    <section className="flex h-[calc(100vh-220px)] min-h-[360px] flex-col overflow-hidden rounded-lg border border-[#E4E7EC] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <div className="h-[65px] shrink-0 border-b border-[#E4E7EC] bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB]"
            aria-label="Previous week"
            onClick={() => onCurrentDateChange(subWeeks(currentDate, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-8 border-[#E4E7EC] px-3 text-[#344054] hover:bg-[#F9FAFB]"
            onClick={() => onCurrentDateChange(new Date())}
          >
            <CalendarDays className="size-4" />
            Today
          </Button>

          <p className="px-2 text-sm font-semibold text-[#101828]">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </p>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB]"
            aria-label="Next week"
            onClick={() => onCurrentDateChange(addWeeks(currentDate, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-[920px]">
          <div className="sticky top-0 z-30 grid grid-cols-[76px_repeat(7,minmax(116px,1fr))] border-b border-[#E4E7EC] bg-white shadow-[0_2px_4px_rgba(16,24,40,0.04)]">
            <div className="sticky left-0 z-40 border-r border-[#E4E7EC] bg-white px-3 py-4 text-xs text-[#667085] shadow-[2px_0_4px_rgba(16,24,40,0.04)]">
              Local time
            </div>

            {weekDays.map((day) => {
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={day.toISOString()}
                  className="border-r border-[#E4E7EC] px-3 py-3 text-center last:border-r-0"
                  style={{
                    backgroundColor: isToday ? "#F0F6FF" : "#FFFFFF",
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{
                      color: isToday ? "#0355DD" : "#101828",
                    }}
                  >
                    {format(day, "EEE d")}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[76px_repeat(7,minmax(116px,1fr))]">
            <div className="sticky left-0 z-20 border-r border-[#E4E7EC] bg-white shadow-[2px_0_4px_rgba(16,24,40,0.04)]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-b border-[#E4E7EC] bg-white px-3 pt-1 text-right text-xs text-[#667085]"
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {weekDays.map((day) => {
              const isToday = isSameDay(day, today);
              const daySegments = segments.filter((segment) =>
                isSameDay(segment.day, day)
              );

              return (
                <div
                  key={day.toISOString()}
                  className="relative border-r border-[#E4E7EC] last:border-r-0"
                  style={{
                    height: hours.length * HOUR_HEIGHT,
                    backgroundColor: isToday ? "#F0F6FF" : "#FFFFFF",
                  }}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: HOUR_HEIGHT }}
                      className="border-b border-[#E4E7EC]"
                    />
                  ))}

                  {daySegments.map((segment) => {
                    const color = getBookingColor();

                    return (
                      <div
                        key={`${segment.booking.id}-${day.toISOString()}`}
                        className="absolute left-1.5 right-1.5 z-10 overflow-hidden rounded-md border px-2 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
                        style={{
                          top: segment.top,
                          height: segment.height,
                          borderColor: color.border,
                          backgroundColor: color.background,
                          color: color.text,
                        }}
                      >
                        <p className="text-[10px] font-medium leading-4">
                          {segment.startsBeforeVisibleRange ? "... " : ""}
                          {format(new Date(segment.booking.startTime), "HH:mm")}
                          {" - "}
                          {format(new Date(segment.booking.endTime), "HH:mm")}
                          {segment.continuesAfterVisibleRange ? " ..." : ""}
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold leading-4">
                          {segment.booking.title}
                        </p>

                        <p className="mt-1 truncate text-[11px] leading-4">
                          {segment.booking.user.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
