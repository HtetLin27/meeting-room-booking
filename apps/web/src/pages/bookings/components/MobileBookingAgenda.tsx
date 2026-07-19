import { eachDayOfInterval, format, isSameDay } from "date-fns";

import type { Booking } from "@/api/booking.api";
import { formatDuration, getBookingDurationMinutes } from "@/lib/booking-utils";

type MobileBookingAgendaProps = {
  bookings: Booking[];
  selectedDate: Date;
  rangeStart: Date;
  rangeEnd: Date;
  onBookingSelect: (booking: Booking) => void;
};

export function MobileBookingAgenda({
  bookings,
  selectedDate,
  rangeStart,
  rangeEnd,
  onBookingSelect,
}: MobileBookingAgendaProps) {
  const days = eachDayOfInterval({
    start: rangeStart,
    end: rangeEnd,
  });

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const groupedDays = days
    .map((day) => ({
      day,
      bookings: sortedBookings.filter((booking) =>
        isSameDay(new Date(booking.startTime), day)
      ),
    }))
    .filter(
      (group) => group.bookings.length > 0 || isSameDay(group.day, selectedDate)
    );

  return (
    <section className="rounded-lg border border-[#E4E7EC] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <div className="border-b border-[#E4E7EC] px-4 py-4">
        <h2 className="text-base font-semibold text-[#101828]">Agenda</h2>
      </div>

      <div className="divide-y divide-[#E4E7EC]">
        {groupedDays.map((group) => (
          <div key={group.day.toISOString()} className="px-4 py-4">
            <div className="flex items-baseline gap-3">
              <p className="text-sm font-semibold text-[#101828]">
                {format(group.day, "MMM d")}
              </p>

              <p className="text-xs font-medium text-[#667085]">
                {format(group.day, "EEEE")}
              </p>
            </div>

            {group.bookings.length === 0 ? (
              <p className="mt-4 rounded-md border border-dashed border-[#E4E7EC] bg-[#F9FAFB] px-3 py-4 text-sm text-[#667085]">
                No bookings for this day.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {group.bookings.map((booking) => (
                  <button
                    type="button"
                    key={booking.id}
                    className="flex w-full gap-3 rounded-md border border-[#E4E7EC] bg-white p-3 text-left transition-colors hover:bg-[#F9FAFB]"
                    onClick={() => onBookingSelect(booking)}
                  >
                    <div className="w-16 shrink-0 text-right">
                      <p className="text-xs font-semibold text-[#101828]">
                        {format(new Date(booking.startTime), "hh:mm a")}
                      </p>

                      <p className="mt-2 text-xs text-[#667085]">
                        {formatDuration(getBookingDurationMinutes(booking))}
                      </p>
                    </div>

                    <div className="w-1 rounded-full bg-[#0355DD]" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#101828]">
                        {booking.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#667085]">
                        Booked by {booking.user.name}
                      </p>

                      <p className="mt-1 text-xs text-[#667085]">
                        Ends {format(new Date(booking.endTime), "hh:mm a")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
