import { isAfter, isBefore, isSameDay, max, min, set } from "date-fns";

import type { AuthUser } from "@/api/auth.api";
import type { Booking } from "@/api/booking.api";

export const START_HOUR = 8;
export const END_HOUR = 24;
export const HOUR_HEIGHT = 64;

// Available room capacity mirrors the visible calendar range: 7 days * 16 hours.
export const AVAILABLE_WEEKLY_ROOM_MINUTES = 7 * (END_HOUR - START_HOUR) * 60;

const bookingColor = {
  border: "#9FC3F9",
  background: "#EAF3FF",
  text: "#174A8B",
  dot: "#0355DD",
} as const;

export type BookingColor = typeof bookingColor;

export type CalendarBookingSegment = {
  booking: Booking;
  day: Date;
  startsBeforeVisibleRange: boolean;
  continuesAfterVisibleRange: boolean;
  top: number;
  height: number;
};

export function getBookingColor(): BookingColor {
  return bookingColor;
}

export function canDeleteBooking(booking: Booking, currentUser: AuthUser) {
  return (
    currentUser.role === "ADMIN" ||
    currentUser.role === "OWNER" ||
    booking.user.id === currentUser.id
  );
}

export function getDurationMinutes(
  startTime: string | Date,
  endTime: string | Date
) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const minutes = (end.getTime() - start.getTime()) / 60000;

  if (Number.isNaN(minutes)) {
    return 0;
  }

  return Math.max(0, Math.round(minutes));
}

export function getBookingDurationMinutes(booking: Booking) {
  return getDurationMinutes(booking.startTime, booking.endTime);
}

export function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`;
}

export function bookingOverlapsRange(
  booking: Booking,
  rangeStart: Date,
  rangeEnd: Date
) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  return isBefore(start, rangeEnd) && isAfter(end, rangeStart);
}

export function getWeekBookings(
  bookings: Booking[],
  weekStart: Date,
  weekEnd: Date
) {
  return bookings.filter((booking) =>
    bookingOverlapsRange(booking, weekStart, weekEnd)
  );
}

export function getUpcomingBookings(bookings: Booking[]) {
  const now = new Date();

  return [...bookings]
    .filter((booking) => isAfter(new Date(booking.endTime), now))
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
}

export function getCalendarBookingSegments(
  bookings: Booking[],
  weekDays: Date[]
): CalendarBookingSegment[] {
  return weekDays.flatMap((day) => {
    const visibleStart = set(day, {
      hours: START_HOUR,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const visibleEnd = set(day, {
      hours: END_HOUR,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    return bookings
      .filter((booking) =>
        bookingOverlapsRange(booking, visibleStart, visibleEnd)
      )
      .map((booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        const segmentStart = max([bookingStart, visibleStart]);
        const segmentEnd = min([bookingEnd, visibleEnd]);
        const topMinutes =
          segmentStart.getHours() * 60 +
          segmentStart.getMinutes() -
          START_HOUR * 60;
        const durationMinutes = getDurationMinutes(segmentStart, segmentEnd);

        return {
          booking,
          day,
          startsBeforeVisibleRange: isBefore(bookingStart, segmentStart),
          continuesAfterVisibleRange: isAfter(bookingEnd, segmentEnd),
          top: (topMinutes / 60) * HOUR_HEIGHT,
          height: Math.max(44, (durationMinutes / 60) * HOUR_HEIGHT),
        };
      });
  });
}

export function getMostBookedDay(bookings: Booking[], weekDays: Date[]) {
  const counts = weekDays.map((day) => ({
    day,
    count: bookings.filter((booking) =>
      isSameDay(new Date(booking.startTime), day)
    ).length,
  }));

  return counts.sort((a, b) => b.count - a.count)[0];
}
