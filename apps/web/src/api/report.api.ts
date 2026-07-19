import { apiClient } from "./client";
import type { UserRole } from "./auth.api";

export type ReportBooking = {
  id: string;
  title: string;
  notes: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
};

export type UserUsageReport = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bookingCount: number;
  bookings: ReportBooking[];
};

export type UsageReport = {
  totalBookings: number;
  users: UserUsageReport[];
};

type UsageReportResponse = {
  success: true;
  message: string;
  data: UsageReport;
};

export const getUsageReport = async () => {
  const response = await apiClient.get<UsageReportResponse>("/reports/usage");

  return response.data.data;
};
