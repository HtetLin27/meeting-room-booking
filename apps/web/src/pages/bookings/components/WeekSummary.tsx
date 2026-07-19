import { format } from "date-fns";

import type { Booking } from "@/api/booking.api";
import {
  AVAILABLE_WEEKLY_ROOM_MINUTES,
  formatDuration,
  getBookingDurationMinutes,
  getMostBookedDay,
} from "@/lib/booking-utils";

type WeekSummaryProps = {
  bookings: Booking[];
  weekDays: Date[];
};

export function WeekSummary({ bookings, weekDays }: WeekSummaryProps) {
  const totalMinutes = bookings.reduce(
    (total, booking) => total + getBookingDurationMinutes(booking),
    0
  );
  const mostBookedDay = getMostBookedDay(bookings, weekDays);
  const utilization = Math.min(
    100,
    Math.round((totalMinutes / AVAILABLE_WEEKLY_ROOM_MINUTES) * 100)
  );

  return (
    <section className="rounded-lg border border-[#E4E7EC] bg-[#FFFFFF] p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <h2 className="text-base font-semibold text-[#101828]">
        This Week Summary
      </h2>

      <div className="mt-5 divide-y divide-[#E4E7EC]">
        <div className="flex items-center justify-between py-3 text-sm">
          <span className="text-[#667085]">Total Bookings</span>
          <strong className="font-semibold text-[#101828]">
            {bookings.length}
          </strong>
        </div>

        <div className="flex items-center justify-between py-3 text-sm">
          <span className="text-[#667085]">Total Hours</span>
          <strong className="font-semibold text-[#101828]">
            {formatDuration(totalMinutes)}
          </strong>
        </div>

        <div className="flex items-center justify-between py-3 text-sm">
          <span className="text-[#667085]">Most Booked Day</span>
          <strong className="font-semibold text-[#101828]">
            {mostBookedDay?.count ? format(mostBookedDay.day, "EEEE") : "-"}
          </strong>
        </div>

        <div className="py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#667085]">Utilization</span>
            <strong className="font-semibold text-[#239650]">
              {utilization}%
            </strong>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EAF3FF]">
            <div
              className="h-full rounded-full bg-[#0355DD] transition-all"
              style={{
                width: `${utilization}%`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
