import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { Role } from "../generated/prisma/client.js";

// Create mock functions
const {
  findUniqueMock,
  createMock,
  countMock,
  updateMock,
  deleteMock,
  hashMock,
} = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  countMock: vi.fn(),
  updateMock: vi.fn(),
  deleteMock: vi.fn(),
  hashMock: vi.fn(),
}));

// Mock Prisma
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
      create: createMock,
      count: countMock,
      update: updateMock,
      delete: deleteMock,
    },
  },
}));

// Mock bcrypt so tests do not spend time hashing real passwords
vi.mock("bcryptjs", () => ({
  default: {
    hash: hashMock,
  },
}));

import {
  createUser,
  deleteUser,
  updateUserRole,
} from "./user.service.js";

describe("createUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    hashMock.mockResolvedValue("hashed-password");
  });

  it("should create a new user", async () => {
    findUniqueMock.mockResolvedValue(null);

    const createdUser = {
      id: "user-id",
      name: "John Doe",
      email: "john@example.com",
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    createMock.mockResolvedValue(createdUser);

    const input = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
      role: Role.USER,
    };

    const result = await createUser(input);

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: {
        email: "john@example.com",
      },
    });

    expect(hashMock).toHaveBeenCalledWith(
      "Password123!",
      12
    );

    expect(createMock).toHaveBeenCalledWith({
      data: {
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "hashed-password",
        role: Role.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    expect(result).toEqual(createdUser);
  });

  it("should reject duplicate email", async () => {
    findUniqueMock.mockResolvedValue({
      id: "existing-user-id",
      email: "john@example.com",
    });

    const input = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
      role: Role.USER,
    };

    await expect(
      createUser(input)
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "EMAIL_ALREADY_EXISTS",
    });

    expect(hashMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });
});

describe("updateUserRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a normal user's role", async () => {
    findUniqueMock.mockResolvedValue({
      id: "user-id",
      name: "John",
      email: "john@example.com",
      role: Role.USER,
    });

    const updatedUser = {
      id: "user-id",
      name: "John",
      email: "john@example.com",
      role: Role.OWNER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    updateMock.mockResolvedValue(updatedUser);

    const result = await updateUserRole(
      "user-id",
      {
        role: Role.OWNER,
      }
    );

    expect(updateMock).toHaveBeenCalledWith({
      where: {
        id: "user-id",
      },
      data: {
        role: Role.OWNER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    expect(result).toEqual(updatedUser);
  });

  it("should reject changing the last ADMIN to another role", async () => {
    findUniqueMock.mockResolvedValue({
      id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: Role.ADMIN,
    });

    countMock.mockResolvedValue(1);

    await expect(
      updateUserRole(
        "admin-id",
        {
          role: Role.USER,
        }
      )
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "LAST_ADMIN_REQUIRED",
    });

    expect(countMock).toHaveBeenCalledWith({
      where: {
        role: "ADMIN",
      },
    });

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("should allow changing an ADMIN role when another ADMIN exists", async () => {
    findUniqueMock.mockResolvedValue({
      id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: Role.ADMIN,
    });

    countMock.mockResolvedValue(2);

    const updatedUser = {
      id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    updateMock.mockResolvedValue(updatedUser);

    const result = await updateUserRole(
      "admin-id",
      {
        role: Role.USER,
      }
    );

    expect(updateMock).toHaveBeenCalled();

    expect(result).toEqual(updatedUser);
  });
});

describe("deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a normal user", async () => {
    findUniqueMock.mockResolvedValue({
      id: "user-id",
      name: "John",
      email: "john@example.com",
      role: Role.USER,
    });

    deleteMock.mockResolvedValue({
      id: "user-id",
    });

    await deleteUser("user-id");

    expect(deleteMock).toHaveBeenCalledWith({
      where: {
        id: "user-id",
      },
    });
  });

  it("should reject deleting the last ADMIN", async () => {
    findUniqueMock.mockResolvedValue({
      id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: Role.ADMIN,
    });

    countMock.mockResolvedValue(1);

    await expect(
      deleteUser("admin-id")
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "LAST_ADMIN_REQUIRED",
    });

    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("should allow deleting an ADMIN when another ADMIN exists", async () => {
    findUniqueMock.mockResolvedValue({
      id: "admin-id",
      name: "Admin",
      email: "admin@example.com",
      role: Role.ADMIN,
    });

    countMock.mockResolvedValue(2);

    deleteMock.mockResolvedValue({
      id: "admin-id",
    });

    await deleteUser("admin-id");

    expect(deleteMock).toHaveBeenCalledWith({
      where: {
        id: "admin-id",
      },
    });
  });

  it("should return 404 when deleting a user that does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    await expect(
      deleteUser("missing-user-id")
    ).rejects.toMatchObject({
      statusCode: 404,
      code: "USER_NOT_FOUND",
    });

    expect(deleteMock).not.toHaveBeenCalled();
  });
});