import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import type { CreateBookingInput } from "../schemas/booking.schema.js";
import type { Role } from "../generated/prisma/client.js";

const MAX_BOOKING_DURATION_MS = 8 * 60 * 60 * 1000;

export const createBooking = async (
  userId: string,
  input: CreateBookingInput
) => {
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);
  const now = new Date();

  // 1. Start time must be before end time
  if (startTime >= endTime) {
    throw new AppError(
      400,
      "INVALID_BOOKING_TIME",
      "Start time must be before end time"
    );
  }

  // 2. Booking must be in the future
  if (startTime <= now) {
    throw new AppError(
      400,
      "BOOKING_IN_PAST",
      "Start time must be in the future"
    );
  }

  // 3. Maximum booking duration is 8 hours
  const duration = endTime.getTime() - startTime.getTime();

  if (duration > MAX_BOOKING_DURATION_MS) {
    throw new AppError(
      400,
      "BOOKING_DURATION_EXCEEDED",
      "Booking duration cannot exceed 8 hours"
    );
  }

  // 4. Check for overlapping bookings
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      startTime: {
        lt: endTime,
      },
      endTime: {
        gt: startTime,
      },
    },
  });

  if (overlappingBooking) {
    throw new AppError(
      409,
      "BOOKING_OVERLAP",
      "This time slot overlaps with an existing booking"
    );
  }

  // 5. Create booking
  const booking = await prisma.booking.create({
    data: {
      title: input.title,
      ...(input.notes !== undefined && {
        notes: input.notes,
      }),
      startTime,
      endTime,
      userId,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      notes: true,
      startTime: true,
      endTime: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return booking;
};

export const getAllBookings = async () => {
  const bookings = await prisma.booking.findMany({
    orderBy: {
      startTime: "asc",
    },
    select: {
      id: true,
      userId: true,
      title: true,
      notes: true,
      startTime: true,
      endTime: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return bookings;
};

export const deleteBooking = async (
  bookingId: string,
  currentUserId: string,
  currentUserRole: Role
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found");
  }

  const isOwnerOfBooking = booking.userId === currentUserId;

  const canDeleteAnyBooking =
    currentUserRole === "ADMIN" || currentUserRole === "OWNER";

  if (!isOwnerOfBooking && !canDeleteAnyBooking) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You do not have permission to delete this booking"
    );
  }

  await prisma.booking.delete({
    where: {
      id: bookingId,
    },
  });
};
