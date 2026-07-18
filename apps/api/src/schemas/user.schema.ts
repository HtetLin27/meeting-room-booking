import { z } from "zod";
import { Role } from "../generated/prisma/client.js";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or less"),

  email: z.email(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be 100 characters or less"),

  role: z.enum(Role),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(Role),
});

export type CreateUserInput = z.infer<
  typeof createUserSchema
>;

export type UpdateUserRoleInput = z.infer<
  typeof updateUserRoleSchema
>;