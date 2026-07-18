import type { Request, Response, NextFunction } from "express";
import { createBooking, getAllBookings, deleteBooking } from "../services/booking.service.js";
import { AppError } from "../errors/app-error.js";

export const createBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication required"
      );
    }

    const booking = await createBooking(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookingsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await getAllBookings();

    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: {
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const deleteBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication required"
      );
    }

    const { id } = req.params;

    if (typeof id !== "string") {
      throw new AppError(
        400,
        "INVALID_BOOKING_ID",
        "Booking id is required"
      );
    }

    await deleteBooking(
      id,
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};