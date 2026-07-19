import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../errors/app-error.js";
import type { CreateUserInput } from "../schemas/user.schema.js";
import type { UpdateUserRoleInput } from "../schemas/user.schema.js";

export const createUser = async (input: CreateUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "A user with this email already exists"
    );
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
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

  return user;
};

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
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

  return users;
};

export const updateUserRole = async (
  userId: string,
  input: UpdateUserRoleInput,
  currentUserId: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  if (currentUserId === userId) {
    throw new AppError(
      409,
      "CANNOT_CHANGE_OWN_ROLE",
      "You cannot change your own role"
    );
  }

  // Prevent changing the last ADMIN to another role
  if (user.role === "ADMIN" && input.role !== "ADMIN") {
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });

    if (adminCount <= 1) {
      throw new AppError(
        409,
        "LAST_ADMIN_REQUIRED",
        "The system must have at least one admin"
      );
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: input.role,
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

  return updatedUser;
};

export const deleteUser = async (userId: string, currentUserId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  if (currentUserId === userId) {
    throw new AppError(
      409,
      "CANNOT_DELETE_SELF",
      "You cannot delete your own account"
    );
  }

  // Prevent deleting the last ADMIN
  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });

    if (adminCount <= 1) {
      throw new AppError(
        409,
        "LAST_ADMIN_REQUIRED",
        "The system must have at least one admin"
      );
    }
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
};
