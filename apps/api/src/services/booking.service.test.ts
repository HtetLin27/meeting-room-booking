import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role } from "../generated/prisma/client.js";

// Create mock functions
const { findFirstMock, findUniqueMock, createMock, deleteMock } = vi.hoisted(
  () => ({
    findFirstMock: vi.fn(),
    findUniqueMock: vi.fn(),
    createMock: vi.fn(),
    deleteMock: vi.fn(),
  })
);

// Mock Prisma
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    booking: {
      findFirst: findFirstMock,
      findUnique: findUniqueMock,
      create: createMock,
      delete: deleteMock,
    },
  },
}));

import { createBooking, deleteBooking } from "./booking.service.js";

describe("createBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when start time is after end time", async () => {
    const input = {
      title: "Test Meeting",
      startTime: "2026-07-25T12:00:00.000Z",
      endTime: "2026-07-25T10:00:00.000Z",
    };

    await expect(createBooking("user-id", input)).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_BOOKING_TIME",
    });

    expect(findFirstMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("should reject a booking in the past", async () => {
    const startTime = new Date(Date.now() - 60 * 60 * 1000);

    const endTime = new Date(Date.now() + 60 * 60 * 1000);

    const input = {
      title: "Past Meeting",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    await expect(createBooking("user-id", input)).rejects.toMatchObject({
      statusCode: 400,
      code: "BOOKING_IN_PAST",
    });

    expect(findFirstMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("should reject bookings longer than 8 hours", async () => {
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const endTime = new Date(startTime.getTime() + 9 * 60 * 60 * 1000);

    const input = {
      title: "Long Meeting",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    await expect(createBooking("user-id", input)).rejects.toMatchObject({
      statusCode: 400,
      code: "BOOKING_DURATION_EXCEEDED",
    });

    expect(findFirstMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });

  it("should reject an overlapping booking", async () => {
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    findFirstMock.mockResolvedValue({
      id: "existing-booking-id",
    });

    const input = {
      title: "Overlapping Meeting",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    await expect(createBooking("user-id", input)).rejects.toMatchObject({
      statusCode: 409,
      code: "BOOKING_OVERLAP",
    });

    expect(createMock).not.toHaveBeenCalled();
  });

  it("should create a valid booking", async () => {
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    findFirstMock.mockResolvedValue(null);

    const createdBooking = {
      id: "booking-id",
      title: "Team Meeting",
      notes: null,
      startTime,
      endTime,
      createdAt: new Date(),
      user: {
        id: "user-id",
        name: "User",
        email: "user@example.com",
        role: Role.USER,
      },
    };

    createMock.mockResolvedValue(createdBooking);

    const input = {
      title: "Team Meeting",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    const result = await createBooking("user-id", input);

    expect(findFirstMock).toHaveBeenCalledWith({
      where: {
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
      },
    });

    expect(createMock).toHaveBeenCalled();

    expect(result).toEqual(createdBooking);
  });
});

describe("deleteBooking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when booking does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    await expect(
      deleteBooking("booking-id", "user-id", Role.USER)
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "BOOKING_NOT_FOUND",
    });

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("should allow a USER to delete their own booking", async () => {
    findUniqueMock.mockResolvedValue({
      id: "booking-id",
      userId: "user-id",
    });

    deleteMock.mockResolvedValue({
      id: "booking-id",
    });

    await deleteBooking("booking-id", "user-id", Role.USER);

    expect(deleteMock).toHaveBeenCalledWith({
      where: {
        id: "booking-id",
      },
    });
  });

  it("should reject a USER deleting another user's booking", async () => {
    findUniqueMock.mockResolvedValue({
      id: "booking-id",
      userId: "another-user-id",
    });

    await expect(
      deleteBooking("booking-id", "user-id", Role.USER)
    ).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("should allow an OWNER to delete any booking", async () => {
    findUniqueMock.mockResolvedValue({
      id: "booking-id",
      userId: "another-user-id",
    });

    deleteMock.mockResolvedValue({
      id: "booking-id",
    });

    await deleteBooking("booking-id", "owner-id", Role.OWNER);

    expect(deleteMock).toHaveBeenCalledWith({
      where: {
        id: "booking-id",
      },
    });
  });

  it("should allow an ADMIN to delete any booking", async () => {
    findUniqueMock.mockResolvedValue({
      id: "booking-id",
      userId: "another-user-id",
    });

    deleteMock.mockResolvedValue({
      id: "booking-id",
    });

    await deleteBooking("booking-id", "admin-id", Role.ADMIN);

    expect(deleteMock).toHaveBeenCalledWith({
      where: {
        id: "booking-id",
      },
    });
  });
});
