import { apiClient } from "./client";
import type { AuthUser } from "./auth.api";

export type Booking = {
  id: string;
  userId: string;
  title: string;
  notes: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  user: AuthUser;
};

export type CreateBookingInput = {
  title: string;
  notes?: string;
  startTime: string;
  endTime: string;
};

type BookingsResponse = {
  success: true;
  message: string;
  data: {
    bookings: Booking[];
  };
};

type CreateBookingResponse = {
  success: true;
  message: string;
  data: {
    booking: Booking;
  };
};

export const getBookings = async () => {
  const response = await apiClient.get<BookingsResponse>("/bookings");

  return response.data.data.bookings;
};

export const createBooking = async (input: CreateBookingInput) => {
  const response = await apiClient.post<CreateBookingResponse>(
    "/bookings",
    input
  );

  return response.data.data.booking;
};

export const deleteBooking = async (bookingId: string) => {
  await apiClient.delete(`/bookings/${bookingId}`);
};
