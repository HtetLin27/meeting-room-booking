import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

interface AuthTokenPayload extends JwtPayload {
  id: string;
}

const isAuthTokenPayload = (
  payload: string | JwtPayload
): payload is AuthTokenPayload => {
  if (typeof payload === "string") {
    return false;
  }

  return typeof payload.id === "string";
};

export const authenticate = async (
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

  let decoded: string | JwtPayload;

  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch {
    return next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }

  if (!isAuthTokenPayload(decoded)) {
    return next(
      new AppError(401, "UNAUTHORIZED", "Invalid authentication token")
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    }

    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
};
