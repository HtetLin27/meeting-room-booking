import type { Request, Response, NextFunction } from "express";
import type { Role } from "../generated/prisma/client.js";
import { AppError } from "../errors/app-error.js";

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          "FORBIDDEN",
          "You do not have permission to perform this action"
        )
      );
    }
    return next();
  };
};
