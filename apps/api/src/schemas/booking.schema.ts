import { z } from "zod";

export const createBookingSchema = z.object({
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

  startTime: z.iso.datetime({
    message: "Start time must be a valid ISO datetime",
  }),

  endTime: z.iso.datetime({
    message: "End time must be a valid ISO datetime",
  }),
});

export type CreateBookingInput = z.infer<
  typeof createBookingSchema
>;