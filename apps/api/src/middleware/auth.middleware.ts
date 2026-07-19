import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

import { Role } from "../generated/prisma/client.js";
import { AppError } from "../errors/app-error.js";

interface AuthTokenPayload extends JwtPayload {
  id: string;
  role: Role;
}

const isAuthTokenPayload = (
  payload: string | JwtPayload
): payload is AuthTokenPayload => {
  if (typeof payload === "string") {
    return false;
  }

  return (
    typeof payload.id === "string" &&
    Object.values(Role).includes(payload.role as Role)
  );
};

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
  }

  const jwtSecret = env.JWT_SECRET;

  if (!jwtSecret) {
    return next(new Error("JWT_SECRET is not defined"));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (!isAuthTokenPayload(decoded)) {
      return next(
        new AppError(401, "UNAUTHORIZED", "Invalid authentication token")
      );
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    return next();
  } catch {
    return next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
};
