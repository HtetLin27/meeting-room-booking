import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { currentUserQueryKey, login } from "@/api/auth.api";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,

    onSuccess: (user) => {
      queryClient.setQueryData(currentUserQueryKey, user);

      toast.success("Login successful");

      navigate("/bookings");
    },

    onError: () => {
      toast.error("Invalid email or password");
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#0355DD] lg:flex lg:items-center">
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="grid h-full grid-cols-6 border-l border-white/70">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border-r border-white/70" />
            ))}
          </div>

          <div className="absolute inset-0 grid grid-rows-6 border-t border-white/70">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border-b border-white/70" />
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px] px-12">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
              <CalendarDays className="size-6 text-white" />
            </div>

            <span className="text-base font-semibold text-white">
              Room Booking
            </span>
          </div>

          <h1 className="mt-16 max-w-[460px] text-5xl font-semibold leading-[1.08] text-white xl:text-[52px]">
            Welcome to
            <br />
            Meeting Room
            <br />
            Booking System
          </h1>

          <p className="mt-6 max-w-[420px] text-lg leading-8 text-white/80">
            Easily manage meeting room schedules and bookings in one simple
            place.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 rounded-xl bg-[#0355DD] px-5 py-5 text-white lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                <CalendarDays className="size-5" />
              </div>

              <span className="text-sm font-semibold">Room Booking</span>
            </div>

            <p className="mt-5 text-2xl font-semibold leading-tight">
              Welcome to Meeting Room Booking System
            </p>
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-[#101828]">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-[#667085]">
              Sign in to your account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-[#344054]">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                className="h-11 border-[#D0D5DD] text-[#344054] placeholder:text-[#98A2B3] focus-visible:border-[#0355DD] focus-visible:ring-[#0355DD]/15"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />

              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-[#344054]">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-11 border-[#D0D5DD] text-[#344054] placeholder:text-[#98A2B3] focus-visible:border-[#0355DD] focus-visible:ring-[#0355DD]/15"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />

              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-[#0355DD] text-white hover:bg-[#0248BD]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
