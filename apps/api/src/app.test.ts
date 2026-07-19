import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "./errors/app-error.js";

const { loginMock, getCurrentUserMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  getCurrentUserMock: vi.fn(),
}));

vi.mock("./services/auth.service.js", () => ({
  login: loginMock,
  getCurrentUser: getCurrentUserMock,
}));

import app from "./app.js";

describe("GET /health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return API health status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({
      success: true,
      message: "API is running",
    });
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login successfully and set authentication cookie", async () => {
    loginMock.mockResolvedValue({
      user: {
        id: "admin-id",
        name: "Admin",
        email: "admin@example.com",
        role: "ADMIN",
      },
      token: "test-jwt-token",
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "Password123!",
      })
      .expect(200);

    expect(loginMock).toHaveBeenCalledWith("admin@example.com", "Password123!");

    expect(response.body).toEqual({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: "admin-id",
          name: "Admin",
          email: "admin@example.com",
          role: "ADMIN",
        },
      },
    });

    const setCookieHeader = response.headers["set-cookie"];

    expect(setCookieHeader).toBeDefined();

    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader];

    const [firstCookie] = cookies;

    if (typeof firstCookie !== "string") {
      throw new Error(
        "Expected set-cookie header to include at least one cookie"
      );
    }

    expect(firstCookie).toContain("token=test-jwt-token");
    expect(firstCookie).toContain("HttpOnly");
  });

  it("should return 401 for invalid credentials", async () => {
    loginMock.mockRejectedValue(
      new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password")
    );

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "WrongPassword",
      })
      .expect(401);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      },
    });
  });

  it("should return 400 for invalid request data", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "invalid-email",
        password: "",
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");

    expect(loginMock).not.toHaveBeenCalled();
  });
});
