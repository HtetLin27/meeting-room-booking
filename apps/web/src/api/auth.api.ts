import { apiClient } from "./client";

export type UserRole = "ADMIN" | "OWNER" | "USER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

type LoginResponse = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
  };
};

type MeResponse = {
  success: true;
  message: string;
  data: {
    user: AuthUser;
  };
};

export const login = async (input: LoginInput) => {
  const response = await apiClient.post<LoginResponse>("/auth/login", input);

  return response.data.data.user;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get<MeResponse>("/auth/me");

  return response.data.data.user;
};

export const logout = async () => {
  await apiClient.post("/auth/logout");
};
