import { prisma } from "../lib/prisma.js";

export const getUsageReport = async () => {
  const users = await prisma.user.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: {
          bookings: true,
        },
      },
      bookings: {
        orderBy: {
          startTime: "asc",
        },
        select: {
          id: true,
          title: true,
          notes: true,
          startTime: true,
          endTime: true,
          createdAt: true,
        },
      },
    },
  });

  const totalBookings = await prisma.booking.count();

  return {
    totalBookings,
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bookingCount: user._count.bookings,
      bookings: user.bookings,
    })),
  };
};