import { apiClient } from "./client";
import type { UserRole } from "./auth.api";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserRoleInput = {
  userId: string;
  role: UserRole;
};

type UsersResponse = {
  success: true;
  message: string;
  data: {
    users: User[];
  };
};

type UserResponse = {
  success: true;
  message: string;
  data: {
    user: User;
  };
};

export const getUsers = async () => {
  const response = await apiClient.get<UsersResponse>("/users");

  return response.data.data.users;
};

export const createUser = async (input: CreateUserInput) => {
  const response = await apiClient.post<UserResponse>("/users", input);

  return response.data.data.user;
};

export const updateUserRole = async ({ userId, role }: UpdateUserRoleInput) => {
  const response = await apiClient.patch<UserResponse>(
    `/users/${userId}/role`,
    {
      role,
    }
  );

  return response.data.data.user;
};

export const deleteUser = async (userId: string) => {
  await apiClient.delete(`/users/${userId}`);
};
