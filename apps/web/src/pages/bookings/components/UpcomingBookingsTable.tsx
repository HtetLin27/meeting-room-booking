import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import type { AuthUser } from "@/api/auth.api";
import type { Booking } from "@/api/booking.api";
import { Button } from "@/components/ui/button";
import {
  canDeleteBooking,
  formatDuration,
  getBookingColor,
  getBookingDurationMinutes,
} from "@/lib/booking-utils";

type UpcomingBookingsTableProps = {
  bookings: Booking[];
  currentUser: AuthUser;
  isDeleting: boolean;
  onDelete: (booking: Booking) => void;
};

export function UpcomingBookingsTable({
  bookings,
  currentUser,
  isDeleting,
  onDelete,
}: UpcomingBookingsTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E4E7EC] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
      <div className="border-b border-[#E4E7EC] px-5 py-4">
        <h2 className="text-base font-semibold text-[#101828]">
          Upcoming Bookings
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-[#F9FAFB] text-xs font-semibold uppercase text-[#667085]">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Start Time</th>
              <th className="px-5 py-3">End Time</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Booked By</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E4E7EC] text-[#475467]">
            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-[#667085]"
                >
                  No upcoming bookings.
                </td>
              </tr>
            )}

            {bookings.map((booking) => {
              const color = getBookingColor();
              const userCanDelete = canDeleteBooking(booking, currentUser);

              return (
                <tr
                  key={booking.id}
                  className="transition-colors hover:bg-[#F9FAFB]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="size-2.5 rounded-full"
                        style={{
                          backgroundColor: color.dot,
                        }}
                      />

                      <span className="font-medium text-[#101828]">
                        {booking.title}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {format(new Date(booking.startTime), "MMM d, yyyy HH:mm")}
                  </td>

                  <td className="px-5 py-4">
                    {format(new Date(booking.endTime), "MMM d, yyyy HH:mm")}
                  </td>

                  <td className="px-5 py-4">
                    {formatDuration(getBookingDurationMinutes(booking))}
                  </td>

                  <td className="px-5 py-4">{booking.user.name}</td>

                  <td className="px-5 py-4">
                    {userCanDelete ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="border-[#E4E7EC] text-red-600 hover:bg-red-50"
                        disabled={isDeleting}
                        aria-label={`Delete ${booking.title}`}
                        onClick={() => onDelete(booking)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : (
                      <span className="text-[#98A2B3]">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
