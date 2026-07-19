import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { Role } from "../generated/prisma/client.js";
import { errorMiddleware } from "./error.middleware.js";

const { findUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
    },
  },
}));

import { authenticate } from "./auth.middleware.js";
import { authorize } from "./role.middleware.js";

const createToken = (
  payload: { id: string; role: Role },
  options?: jwt.SignOptions
) => jwt.sign(payload, env.JWT_SECRET, options);

const createTestApp = () => {
  const app = express();

  app.use(cookieParser());

  app.get("/protected", authenticate, (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    }

    return res.status(200).json({
      user: req.user,
    });
  });

  app.get("/admin", authenticate, authorize(Role.ADMIN), (_req, res) =>
    res.status(200).json({ ok: true })
  );

  app.use(errorMiddleware);

  return app;
};

describe("authenticate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should authenticate a valid JWT and attach the current database role", async () => {
    const app = createTestApp();
    const token = createToken({ id: "user-id", role: Role.USER });

    findUniqueMock.mockResolvedValue({
      id: "user-id",
      role: Role.OWNER,
    });

    const response = await request(app)
      .get("/protected")
      .set("Cookie", [`token=${token}`])
      .expect(200);

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: {
        id: "user-id",
      },
      select: {
        id: true,
        role: true,
      },
    });

    expect(response.body).toEqual({
      user: {
        id: "user-id",
        role: Role.OWNER,
      },
    });
  });

  it("should reject an admin-only route when the JWT role is stale", async () => {
    const app = createTestApp();
    const token = createToken({ id: "user-id", role: Role.ADMIN });

    findUniqueMock.mockResolvedValue({
      id: "user-id",
      role: Role.USER,
    });

    const response = await request(app)
      .get("/admin")
      .set("Cookie", [`token=${token}`])
      .expect(403);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action",
      },
    });
  });

  it("should return 401 when the token user no longer exists", async () => {
    const app = createTestApp();
    const token = createToken({ id: "deleted-user-id", role: Role.ADMIN });

    findUniqueMock.mockResolvedValue(null);

    const response = await request(app)
      .get("/protected")
      .set("Cookie", [`token=${token}`])
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
  });

  it("should return 401 for an invalid JWT", async () => {
    const app = createTestApp();

    const response = await request(app)
      .get("/protected")
      .set("Cookie", ["token=invalid-token"])
      .expect(401);

    expect(findUniqueMock).not.toHaveBeenCalled();

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  });

  it("should return 401 for an expired JWT", async () => {
    const app = createTestApp();
    const token = createToken(
      { id: "user-id", role: Role.USER },
      { expiresIn: "-1s" }
    );

    const response = await request(app)
      .get("/protected")
      .set("Cookie", [`token=${token}`])
      .expect(401);

    expect(findUniqueMock).not.toHaveBeenCalled();

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  });
});
