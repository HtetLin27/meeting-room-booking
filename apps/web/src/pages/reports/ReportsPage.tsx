import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BarChart3, CalendarDays, Clock3, Crown, Users } from "lucide-react";

import {
  getUsageReport,
  type ReportBooking,
  type UserUsageReport,
} from "@/api/report.api";

import { Badge } from "@/components/ui/badge";

function getBookingDurationMinutes(booking: ReportBooking) {
  const startTime = new Date(booking.startTime).getTime();

  const endTime = new Date(booking.endTime).getTime();

  return Math.max(0, (endTime - startTime) / (1000 * 60));
}

function getUserTotalMinutes(user: UserUsageReport) {
  return user.bookings.reduce(
    (total, booking) => total + getBookingDurationMinutes(booking),
    0
  );
}

function formatDuration(totalMinutes: number) {
  const roundedMinutes = Math.round(totalMinutes);

  const hours = Math.floor(roundedMinutes / 60);

  const minutes = roundedMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function getRoleBadgeClass(role: UserUsageReport["role"]) {
  switch (role) {
    case "ADMIN":
      return "border-[#B2CCFF] bg-[#EFF4FF] text-[#3538CD]";

    case "OWNER":
      return "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]";

    default:
      return "border-[#E4E7EC] bg-[#F9FAFB] text-[#344054]";
  }
}

function MobileUsageCards({
  users,
  totalBookings,
}: {
  users: UserUsageReport[];
  totalBookings: number;
}) {
  return (
    <div className="space-y-3 p-4 md:hidden">
      {users.map((user) => {
        const userMinutes = getUserTotalMinutes(user);
        const usagePercentage =
          totalBookings > 0
            ? Math.round((user.bookingCount / totalBookings) * 100)
            : 0;

        return (
          <article
            key={user.id}
            className="rounded-lg border border-[#E4E7EC] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-[#101828]">
                  {user.name}
                </h3>

                <p className="mt-1 truncate text-sm text-[#667085]">
                  {user.email}
                </p>
              </div>

              <Badge variant="outline" className={getRoleBadgeClass(user.role)}>
                {user.role}
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#667085]">Bookings</span>

                <strong className="font-semibold text-[#101828]">
                  {user.bookingCount}
                </strong>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#667085]">Total Time</span>

                <strong className="font-semibold text-[#101828]">
                  {formatDuration(userMinutes)}
                </strong>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#667085]">Usage</span>

                  <strong className="font-semibold text-[#101828]">
                    {usagePercentage}%
                  </strong>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EAECF0]">
                  <div
                    className="h-full rounded-full bg-[#0355DD]"
                    style={{
                      width: `${usagePercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MobileBookingDetails({ bookings }: { bookings: ReportBooking[] }) {
  return (
    <div className="space-y-3 p-4 md:hidden">
      {bookings.map((booking) => (
        <article
          key={booking.id}
          className="rounded-lg border border-[#E4E7EC] bg-white p-4"
        >
          <h4 className="text-sm font-semibold text-[#101828]">
            {booking.title}
          </h4>

          <div className="mt-3 space-y-2 text-sm">
            <div>
              <p className="text-xs font-medium text-[#667085]">Date</p>

              <p className="mt-1 text-[#101828]">
                {format(new Date(booking.startTime), "MMM d, yyyy")}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[#667085]">Time</p>

              <p className="mt-1 text-[#101828]">
                {format(new Date(booking.startTime), "h:mm a")}
                {" - "}
                {format(new Date(booking.endTime), "h:mm a")}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[#667085]">Duration</p>

              <p className="mt-1 text-[#101828]">
                {formatDuration(getBookingDurationMinutes(booking))}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-[#667085]">Notes</p>

              <p className="mt-1 whitespace-pre-wrap text-[#101828]">
                {booking.notes || "No notes."}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ReportsPage() {
  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["usage-report"],
    queryFn: getUsageReport,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-[#667085]">Loading reports...</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-[#101828]">
            Unable to load reports
          </h2>

          <p className="mt-1 text-sm text-[#667085]">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  const activeUsers = report.users.filter((user) => user.bookingCount > 0);

  const totalMinutes = report.users.reduce(
    (total, user) => total + getUserTotalMinutes(user),
    0
  );

  const sortedUsers = [...report.users].sort(
    (a, b) => b.bookingCount - a.bookingCount
  );

  const mostActiveUser =
    sortedUsers[0] && sortedUsers[0].bookingCount > 0 ? sortedUsers[0] : null;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-[#101828] md:text-2xl">
          Reports
        </h1>

        <p className="mt-1 text-sm text-[#667085]">
          View booking usage and activity across users.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total bookings */}
        <section className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-lg bg-[#EEF5FF]">
              <CalendarDays className="size-5 text-[#0355DD]" />
            </div>
          </div>

          <p className="mt-5 text-sm text-[#667085]">Total Bookings</p>

          <p className="mt-1 text-2xl font-semibold text-[#101828]">
            {report.totalBookings}
          </p>
        </section>

        {/* Active users */}
        <section className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#EEF5FF]">
            <Users className="size-5 text-[#0355DD]" />
          </div>

          <p className="mt-5 text-sm text-[#667085]">Active Users</p>

          <p className="mt-1 text-2xl font-semibold text-[#101828]">
            {activeUsers.length}
          </p>

          <p className="mt-1 text-xs text-[#98A2B3]">
            of {report.users.length} total users
          </p>
        </section>

        {/* Total hours */}
        <section className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#EEF5FF]">
            <Clock3 className="size-5 text-[#0355DD]" />
          </div>

          <p className="mt-5 text-sm text-[#667085]">Total Booked Time</p>

          <p className="mt-1 text-2xl font-semibold text-[#101828]">
            {formatDuration(totalMinutes)}
          </p>
        </section>

        {/* Most active user */}
        <section className="rounded-xl border border-[#E4E7EC] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#EEF5FF]">
            <Crown className="size-5 text-[#0355DD]" />
          </div>

          <p className="mt-5 text-sm text-[#667085]">Most Active User</p>

          <p className="mt-1 truncate text-lg font-semibold text-[#101828]">
            {mostActiveUser ? mostActiveUser.name : "—"}
          </p>

          {mostActiveUser && (
            <p className="mt-1 text-xs text-[#98A2B3]">
              {mostActiveUser.bookingCount}{" "}
              {mostActiveUser.bookingCount === 1 ? "booking" : "bookings"}
            </p>
          )}
        </section>
      </div>

      {/* User usage table */}
      <section className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
        <div className="border-b border-[#E4E7EC] px-6 py-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="size-5 text-[#0355DD]" />

            <div>
              <h2 className="font-semibold text-[#101828]">
                Booking Usage by User
              </h2>

              <p className="mt-1 text-sm text-[#667085]">
                Compare booking activity across all users.
              </p>
            </div>
          </div>
        </div>

        <MobileUsageCards
          users={sortedUsers}
          totalBookings={report.totalBookings}
        />

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
              <tr className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                <th className="px-6 py-3">User</th>

                <th className="px-6 py-3">Role</th>

                <th className="px-6 py-3">Bookings</th>

                <th className="px-6 py-3">Total Time</th>

                <th className="px-6 py-3">Usage</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E4E7EC]">
              {sortedUsers.map((user) => {
                const userMinutes = getUserTotalMinutes(user);

                const usagePercentage =
                  report.totalBookings > 0
                    ? Math.round(
                        (user.bookingCount / report.totalBookings) * 100
                      )
                    : 0;

                return (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-[#F9FAFB]"
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#101828]">{user.name}</p>

                      <p className="mt-1 text-sm text-[#667085]">
                        {user.email}
                      </p>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={getRoleBadgeClass(user.role)}
                      >
                        {user.role}
                      </Badge>
                    </td>

                    {/* Booking count */}
                    <td className="px-6 py-4 text-sm font-medium text-[#344054]">
                      {user.bookingCount}
                    </td>

                    {/* Total time */}
                    <td className="px-6 py-4 text-sm text-[#475467]">
                      {formatDuration(userMinutes)}
                    </td>

                    {/* Usage percentage */}
                    <td className="px-6 py-4">
                      <div className="flex w-40 items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EAECF0]">
                          <div
                            className="h-full rounded-full bg-[#0355DD]"
                            style={{
                              width: `${usagePercentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-10 text-right text-sm text-[#475467]">
                          {usagePercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {report.users.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-[#667085]">No user data available.</p>
          </div>
        )}
      </section>

      {/* User booking details */}
      <section className="rounded-xl border border-[#E4E7EC] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
        <div className="border-b border-[#E4E7EC] px-6 py-4">
          <h2 className="font-semibold text-[#101828]">User Booking Details</h2>

          <p className="mt-1 text-sm text-[#667085]">
            View bookings grouped by each user.
          </p>
        </div>

        <div className="divide-y divide-[#E4E7EC]">
          {sortedUsers.map((user) => (
            <details key={user.id} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-[#F9FAFB]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[#101828]">{user.name}</p>

                    <Badge
                      variant="outline"
                      className={getRoleBadgeClass(user.role)}
                    >
                      {user.role}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-[#667085]">{user.email}</p>
                </div>

                <div className="flex shrink-0 items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#101828]">
                      {user.bookingCount}
                    </p>

                    <p className="text-xs text-[#667085]">Bookings</p>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-[#101828]">
                      {formatDuration(getUserTotalMinutes(user))}
                    </p>

                    <p className="text-xs text-[#667085]">Total time</p>
                  </div>

                  <span className="text-sm text-[#667085] transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </div>
              </summary>

              <div className="border-t border-[#E4E7EC] bg-[#FCFCFD]">
                {user.bookings.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-[#667085]">
                      This user has no bookings.
                    </p>
                  </div>
                ) : (
                  <>
                    <MobileBookingDetails bookings={user.bookings} />

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[700px] text-left">
                        <thead>
                          <tr className="border-b border-[#E4E7EC] text-xs font-medium uppercase text-[#667085]">
                            <th className="px-6 py-3">Title</th>

                            <th className="px-6 py-3">Start</th>

                            <th className="px-6 py-3">End</th>

                            <th className="px-6 py-3">Duration</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E4E7EC]">
                          {user.bookings.map((booking) => (
                            <tr key={booking.id} className="bg-white">
                              <td className="px-6 py-4">
                                <p className="font-medium text-[#101828]">
                                  {booking.title}
                                </p>

                                {booking.notes && (
                                  <p className="mt-1 max-w-sm truncate text-sm text-[#667085]">
                                    {booking.notes}
                                  </p>
                                )}
                              </td>

                              <td className="px-6 py-4 text-sm text-[#475467]">
                                {format(
                                  new Date(booking.startTime),
                                  "MMM d, yyyy h:mm a"
                                )}
                              </td>

                              <td className="px-6 py-4 text-sm text-[#475467]">
                                {format(
                                  new Date(booking.endTime),
                                  "MMM d, yyyy h:mm a"
                                )}
                              </td>

                              <td className="px-6 py-4 text-sm text-[#475467]">
                                {formatDuration(
                                  getBookingDurationMinutes(booking)
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
