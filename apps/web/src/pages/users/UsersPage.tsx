import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { ChevronDown, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { getCurrentUser, type AuthUser, type UserRole } from "@/api/auth.api";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUserRole,
  type User,
} from "@/api/user.api";

import {
  createUserSchema,
  type CreateUserFormValues,
} from "@/schemas/user.schema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ApiErrorResponse = {
  success?: false;

  error?: {
    code?: string;
    message?: string;
  };

  message?: string;
};

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      "Something went wrong"
    );
  }

  return "Something went wrong";
}

const roleOptions: UserRole[] = ["USER", "OWNER", "ADMIN"];

const roleSelectorStyles: Record<
  UserRole,
  {
    label: string;
    trigger: string;
    dot: string;
    text: string;
  }
> = {
  USER: {
    label: "User",
    trigger: "border-[#E4E7EC] bg-[#F2F4F7] text-[#344054]",
    dot: "bg-[#667085]",
    text: "text-[#344054]",
  },
  OWNER: {
    label: "Owner",
    trigger: "border-[#D9D6FE] bg-[#F4F3FF] text-[#5925DC]",
    dot: "bg-[#7F56D9]",
    text: "text-[#5925DC]",
  },
  ADMIN: {
    label: "Admin",
    trigger: "border-[#B2CCFF] bg-[#EEF4FF] text-[#1849A9]",
    dot: "bg-[#0355DD]",
    text: "text-[#1849A9]",
  },
};

function RoleSelector({
  id,
  role,
  disabled,
  className,
  onChange,
}: {
  id?: string;
  role: UserRole;
  disabled: boolean;
  className?: string;
  onChange: (role: UserRole) => void;
}) {
  const style = roleSelectorStyles[role];

  return (
    <div
      className={cn("relative inline-flex w-[130px]", style.text, className)}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 z-10 size-2 -translate-y-1/2 rounded-full",
          style.dot
        )}
      />

      <select
        id={id}
        value={role}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as UserRole)}
        className={cn(
          "h-9 w-full appearance-none rounded-full border py-0 pl-7 pr-8 text-sm font-medium outline-none transition focus:border-[#0355DD] focus:ring-2 focus:ring-[#0355DD]/10 disabled:cursor-not-allowed disabled:opacity-60",
          style.trigger
        )}
      >
        {roleOptions.map((option) => (
          <option key={option} value={option}>
            {roleSelectorStyles[option].label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-current opacity-70" />
    </div>
  );
}

function UsersTable({
  users,
  currentUser,
  isUpdatingRole,
  isDeleting,
  onRoleChange,
  onDelete,
}: {
  users: User[];
  currentUser: AuthUser;
  isUpdatingRole: boolean;
  isDeleting: boolean;

  onRoleChange: (user: User, role: UserRole) => void;

  onDelete: (user: User) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left">
        <thead className="border-b border-[#E4E7EC] bg-[#F9FAFB]">
          <tr className="text-xs font-medium uppercase tracking-wide text-[#667085]">
            <th className="px-6 py-3">User</th>

            <th className="px-6 py-3">Role</th>

            <th className="px-6 py-3">Created</th>

            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#E4E7EC]">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUser.id;

            return (
              <tr
                key={user.id}
                className="transition-colors hover:bg-[#F9FAFB]"
              >
                {/* User */}
                <td className="px-6 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#101828]">{user.name}</p>

                      {isCurrentUser && <Badge variant="outline">You</Badge>}
                    </div>

                    <p className="mt-1 text-sm text-[#667085]">{user.email}</p>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 align-middle">
                  <RoleSelector
                    role={user.role}
                    disabled={isUpdatingRole}
                    onChange={(role) => onRoleChange(user, role)}
                  />
                </td>

                {/* Created */}
                <td className="px-6 py-4 text-sm text-[#475467]">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isDeleting}
                    aria-label={`Delete ${user.name}`}
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MobileUsersCards({
  users,
  currentUser,
  isUpdatingRole,
  isDeleting,
  onRoleChange,
  onDelete,
}: {
  users: User[];
  currentUser: AuthUser;
  isUpdatingRole: boolean;
  isDeleting: boolean;

  onRoleChange: (user: User, role: UserRole) => void;

  onDelete: (user: User) => void;
}) {
  return (
    <div className="space-y-3 p-4 md:hidden">
      {users.map((user) => {
        const isCurrentUser = user.id === currentUser.id;

        return (
          <article
            key={user.id}
            className="rounded-lg border border-[#E4E7EC] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-[#101828]">
                    {user.name}
                  </h3>

                  {isCurrentUser && <Badge variant="outline">You</Badge>}
                </div>

                <p className="mt-1 truncate text-sm text-[#667085]">
                  {user.email}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#667085]">
              Created:{" "}
              <span className="font-medium text-[#344054]">
                {format(new Date(user.createdAt), "MMM d, yyyy")}
              </span>
            </p>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`role-${user.id}`}>Role</Label>

              <RoleSelector
                id={`role-${user.id}`}
                role={user.role}
                disabled={isUpdatingRole}
                className="w-full"
                onChange={(role) => onRoleChange(user, role)}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-[#E4E7EC] text-red-600 hover:bg-red-50"
                disabled={isDeleting}
                aria-label={`Delete ${user.name}`}
                onClick={() => onDelete(user)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function UsersPage() {
  const queryClient = useQueryClient();

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),

    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  /*
   * Create user
   */
  const createMutation = useMutation({
    mutationFn: createUser,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.success("User created successfully");

      reset();

      setIsCreateUserOpen(false);
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  /*
   * Change user role
   */
  const updateRoleMutation = useMutation({
    mutationFn: updateUserRole,

    onSuccess: async (updatedUser) => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      /*
       * If the logged-in Admin
       * changes their own role,
       * update the auth cache too.
       */
      if (updatedUser.id === currentUser?.id) {
        queryClient.setQueryData(["current-user"], {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        });
      }

      toast.success("User role updated");
    },

    onError: (error) => {
      /*
       * Refresh users so the select
       * returns to the real server value.
       */
      void queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.error(getErrorMessage(error));
    },
  });

  /*
   * Delete user
   */
  const deleteMutation = useMutation({
    mutationFn: deleteUser,

    onSuccess: async (_, deletedUserId) => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      /*
       * Deleting a user also deletes
       * their bookings in the backend,
       * so refresh bookings too.
       */
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      /*
       * Normally an Admin should avoid
       * deleting their own account.
       * If the backend allows it,
       * clear auth state.
       */
      if (deletedUserId === currentUser?.id) {
        queryClient.removeQueries({
          queryKey: ["current-user"],
        });
      }

      toast.success("User deleted successfully");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = (values: CreateUserFormValues) => {
    createMutation.mutate({
      name: values.name.trim(),

      email: values.email.trim().toLowerCase(),

      password: values.password,

      role: values.role,
    });
  };

  const handleRoleChange = (user: User, role: UserRole) => {
    if (role === user.role) {
      return;
    }

    updateRoleMutation.mutate({
      userId: user.id,
      role,
    });
  };

  const handleDelete = (user: User) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.name}"?\n\nTheir bookings will also be deleted.`
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(user.id);
  };

  const handleDialogChange = (open: boolean) => {
    setIsCreateUserOpen(open);

    if (!open) {
      reset();
    }
  };

  if (isUsersLoading || isCurrentUserLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-[#667085]">Loading users...</p>
      </div>
    );
  }

  if (isError || !currentUser) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-[#101828]">Unable to load users</h2>

          <p className="mt-1 text-sm text-[#667085]">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#101828] md:text-2xl">
              Users
            </h1>

            <p className="mt-1 text-sm text-[#667085]">
              Manage user accounts and roles.
            </p>
          </div>

          <Button
            type="button"
            className="w-full bg-[#0355DD] text-white hover:bg-[#0248BD] sm:w-auto"
            onClick={() => setIsCreateUserOpen(true)}
          >
            <Plus className="size-4" />
            Add User
          </Button>
        </div>

        {/* Users table card */}
        <section className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <div className="flex items-center justify-between border-b border-[#E4E7EC] px-6 py-4">
            <div>
              <h2 className="font-semibold text-[#101828]">All Users</h2>

              <p className="mt-1 text-sm text-[#667085]">
                {users.length} {users.length === 1 ? "user" : "users"}
              </p>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#EEF5FF]">
                <Users className="size-6 text-[#0355DD]" />
              </div>

              <h3 className="mt-4 font-semibold text-[#101828]">
                No users found
              </h3>

              <p className="mt-1 text-sm text-[#667085]">
                Add a user to get started.
              </p>
            </div>
          ) : (
            <>
              <MobileUsersCards
                users={users}
                currentUser={currentUser}
                isUpdatingRole={updateRoleMutation.isPending}
                isDeleting={deleteMutation.isPending}
                onRoleChange={handleRoleChange}
                onDelete={handleDelete}
              />

              <div className="hidden md:block">
                <UsersTable
                  users={users}
                  currentUser={currentUser}
                  isUpdatingRole={updateRoleMutation.isPending}
                  isDeleting={deleteMutation.isPending}
                  onRoleChange={handleRoleChange}
                  onDelete={handleDelete}
                />
              </div>
            </>
          )}
        </section>
      </div>

      {/* Create user dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>

            <DialogDescription>
              Create a new user account and assign their role.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>

              <Input id="name" placeholder="John Doe" {...register("name")} />

              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                {...register("password")}
              />

              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>

              <select
                id="role"
                {...register("role")}
                className="flex h-10 w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition focus:border-[#0355DD] focus:ring-2 focus:ring-[#0355DD]/10"
              >
                <option value="USER">User</option>

                <option value="OWNER">Owner</option>

                <option value="ADMIN">Admin</option>
              </select>

              {errors.role && (
                <p className="text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={createMutation.isPending}
                onClick={() => handleDialogChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-[#0355DD] text-white hover:bg-[#0248BD]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
