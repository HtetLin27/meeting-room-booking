import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import type { AuthUser } from "@/api/auth.api";
import type { Booking } from "@/api/booking.api";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  canDeleteBooking,
  formatDuration,
  getBookingDurationMinutes,
} from "@/lib/booking-utils";

type BookingDetailSheetProps = {
  booking: Booking | null;
  currentUser: AuthUser;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (booking: Booking) => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <span className="shrink-0 text-[#667085]">{label}</span>

      <span className="text-right font-medium text-[#101828]">{value}</span>
    </div>
  );
}

export function BookingDetailSheet({
  booking,
  currentUser,
  isDeleting,
  onOpenChange,
  onDelete,
}: BookingDetailSheetProps) {
  const userCanDelete = booking && canDeleteBooking(booking, currentUser);

  return (
    <Sheet open={Boolean(booking)} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] gap-0 rounded-t-2xl border-[#E4E7EC] bg-[#FFFFFF] p-0 lg:hidden"
      >
        {booking && (
          <>
            <SheetHeader className="border-b border-[#E4E7EC] px-5 py-5">
              <SheetTitle className="pr-8 text-lg font-semibold text-[#101828]">
                {booking.title}
              </SheetTitle>

              <SheetDescription className="mt-1 text-sm text-[#667085]">
                Booking details
              </SheetDescription>
            </SheetHeader>

            <div className="overflow-y-auto px-5 py-3">
              <div className="divide-y divide-[#E4E7EC]">
                <DetailRow
                  label="Date"
                  value={format(
                    new Date(booking.startTime),
                    "EEEE, MMM d, yyyy"
                  )}
                />

                <DetailRow
                  label="Start time"
                  value={format(new Date(booking.startTime), "hh:mm a")}
                />

                <DetailRow
                  label="End time"
                  value={format(new Date(booking.endTime), "hh:mm a")}
                />

                <DetailRow
                  label="Duration"
                  value={formatDuration(getBookingDurationMinutes(booking))}
                />

                <DetailRow label="Booked by" value={booking.user.name} />
              </div>

              <div className="mt-4 rounded-md border border-[#E4E7EC] bg-[#F9FAFB] p-3">
                <p className="text-xs font-medium text-[#667085]">Notes</p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-[#101828]">
                  {booking.notes || "No notes."}
                </p>
              </div>
            </div>

            {userCanDelete && (
              <div className="border-t border-[#E4E7EC] p-5">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full border-[#E4E7EC] text-red-600 hover:bg-red-50"
                  disabled={isDeleting}
                  onClick={() => onDelete(booking)}
                >
                  <Trash2 className="size-4" />
                  Delete Booking
                </Button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
