import { format } from "date-fns";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { AuthUser } from "@/api/auth.api";
import type { Booking } from "@/api/booking.api";
import { Button } from "@/components/ui/button";
import {
  canDeleteBooking,
  formatDuration,
  getBookingColor,
  getBookingDurationMinutes,
} from "@/lib/booking-utils";

type UpcomingBookingsAccordionProps = {
  bookings: Booking[];
  currentUser: AuthUser;
  isDeleting: boolean;
  onDelete: (booking: Booking) => void;
};

type BookingGroup = {
  dateKey: string;
  date: Date;
  bookings: Booking[];
};

function getBookingLabel(count: number) {
  return count === 1 ? "1 booking" : `${count} bookings`;
}

export function UpcomingBookingsAccordion({
  bookings,
  currentUser,
  isDeleting,
  onDelete,
}: UpcomingBookingsAccordionProps) {
  const [openDateKey, setOpenDateKey] = useState<string | null | undefined>(
    undefined
  );

  const groups = useMemo<BookingGroup[]>(() => {
    const groupedBookings = new Map<string, BookingGroup>();

    for (const booking of bookings) {
      const startDate = new Date(booking.startTime);
      const dateKey = format(startDate, "yyyy-MM-dd");
      const existingGroup = groupedBookings.get(dateKey);

      if (existingGroup) {
        existingGroup.bookings.push(booking);
      } else {
        groupedBookings.set(dateKey, {
          dateKey,
          date: startDate,
          bookings: [booking],
        });
      }
    }

    return Array.from(groupedBookings.values())
      .map((group) => ({
        ...group,
        bookings: [...group.bookings].sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [bookings]);

  const activeDateKey =
    openDateKey === undefined ? groups[0]?.dateKey : openDateKey;

  return (
    <section className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <div className="border-b border-[#E4E7EC] px-4 py-4">
        <h2 className="text-base font-semibold text-[#101828]">
          Upcoming Bookings
        </h2>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {groups.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-[#667085]">
            No upcoming bookings.
          </div>
        )}

        <div className="divide-y divide-[#E4E7EC]">
          {groups.map((group) => {
            const isOpen = activeDateKey === group.dateKey;
            const Icon = isOpen ? ChevronDown : ChevronRight;

            return (
              <div key={group.dateKey}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-[#F9FAFB]"
                  onClick={() => setOpenDateKey(isOpen ? null : group.dateKey)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="size-4 shrink-0 text-[#667085]" />

                    <span className="truncate text-sm font-semibold text-[#101828]">
                      {format(group.date, "EEEE, MMM d")}
                    </span>
                  </span>

                  <span className="shrink-0 text-xs font-medium text-[#667085]">
                    {getBookingLabel(group.bookings.length)}
                  </span>
                </button>

                {isOpen && (
                  <div className="space-y-2 bg-[#F9FAFB] px-3 pb-3">
                    {group.bookings.map((booking) => {
                      const color = getBookingColor();
                      const userCanDelete = canDeleteBooking(
                        booking,
                        currentUser
                      );

                      return (
                        <div
                          key={booking.id}
                          className="rounded-md border border-[#E4E7EC] bg-white p-3"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className="mt-1.5 size-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor: color.dot,
                              }}
                            />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#101828]">
                                {booking.title}
                              </p>

                              <p className="mt-1 text-xs font-medium text-[#344054]">
                                {format(new Date(booking.startTime), "HH:mm")}
                                {" - "}
                                {format(new Date(booking.endTime), "HH:mm")}
                              </p>

                              <p className="mt-1 truncate text-xs text-[#667085]">
                                Booked by {booking.user.name}
                              </p>

                              <p className="mt-1 text-xs text-[#667085]">
                                {formatDuration(
                                  getBookingDurationMinutes(booking)
                                )}
                              </p>
                            </div>

                            {userCanDelete && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8 shrink-0 border-[#E4E7EC] text-red-600 hover:bg-red-50"
                                disabled={isDeleting}
                                aria-label={`Delete ${booking.title}`}
                                onClick={() => onDelete(booking)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
