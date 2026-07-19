import { z } from "zod";

const MAX_BOOKING_DURATION_MS = 8 * 60 * 60 * 1000;

export const createBookingFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Title must be 100 characters or less"),

    notes: z
      .string()
      .trim()
      .max(500, "Notes must be 500 characters or less")
      .optional(),

    startTime: z.string().min(1, "Start time is required"),

    endTime: z.string().min(1, "End time is required"),
  })
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const now = new Date();

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return;
    }

    if (startTime <= now) {
      ctx.addIssue({
        code: "custom",
        path: ["startTime"],
        message: "Start time must be in the future",
      });
    }

    if (endTime <= startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });

      return;
    }

    const duration = endTime.getTime() - startTime.getTime();

    if (duration > MAX_BOOKING_DURATION_MS) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Booking duration cannot exceed 8 hours",
      });
    }
  });

export type CreateBookingFormValues = z.infer<typeof createBookingFormSchema>;
