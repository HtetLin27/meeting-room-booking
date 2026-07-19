import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { eachDayOfInterval, endOfWeek, startOfWeek } from "date-fns";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  createBooking,
  deleteBooking,
  getBookings,
  type Booking,
} from "@/api/booking.api";
import { currentUserQueryOptions } from "@/api/auth.api";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BookingDetailSheet } from "@/pages/bookings/components/BookingDetailSheet";
import { CreateBookingForm } from "@/pages/bookings/components/CreateBookingForm";
import { MobileBookingAgenda } from "@/pages/bookings/components/MobileBookingAgenda";
import { MobileDateStrip } from "@/pages/bookings/components/MobileDateStrip";
import { UpcomingBookingsAccordion } from "@/pages/bookings/components/UpcomingBookingsAccordion";
import { WeekSummary } from "@/pages/bookings/components/WeekSummary";
import { WeeklyCalendar } from "@/pages/bookings/components/WeeklyCalendar";
import {
  createBookingFormSchema,
  type CreateBookingFormValues,
} from "@/schemas/booking.schema";
import {
  formatDuration,
  getDefaultBookingDateTimes,
  getDurationMinutes,
  getUpcomingBookings,
  getWeekBookings,
} from "@/lib/booking-utils";

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

export function BookingsPage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mobileSelectedDate, setMobileSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null
  );

  const weekStart = startOfWeek(currentDate, {
    weekStartsOn: 1,
  });
  const weekEnd = endOfWeek(currentDate, {
    weekStartsOn: 1,
  });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });
  const mobileWeekStart = startOfWeek(mobileSelectedDate, {
    weekStartsOn: 0,
  });
  const mobileWeekEnd = endOfWeek(mobileSelectedDate, {
    weekStartsOn: 0,
  });
  const mobileWeekDays = eachDayOfInterval({
    start: mobileWeekStart,
    end: mobileWeekEnd,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateBookingFormValues>({
    resolver: standardSchemaResolver(createBookingFormSchema),
    defaultValues: {
      title: "",
      notes: "",
      startTime: "",
      endTime: "",
    },
  });

  const startTimeValue = useWatch({
    control,
    name: "startTime",
  });
  const endTimeValue = useWatch({
    control,
    name: "endTime",
  });

  const selectedDuration = useMemo(() => {
    if (!startTimeValue || !endTimeValue) {
      return null;
    }

    const minutes = getDurationMinutes(startTimeValue, endTimeValue);

    if (minutes <= 0) {
      return null;
    }

    return formatDuration(minutes);
  }, [startTimeValue, endTimeValue]);

  const { data: currentUser, isLoading: userLoading } = useQuery(
    currentUserQueryOptions
  );

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isError,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: getBookings,
  });

  const createMutation = useMutation({
    mutationFn: createBooking,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      reset();
      setCreateErrorMessage(null);
      setNewBookingOpen(false);
      toast.success("Booking created successfully");
    },

    onError: (error) => {
      const message = getErrorMessage(error);

      setCreateErrorMessage(message);
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      setBookingToDelete(null);
      setSelectedBooking(null);
      toast.success("Booking deleted successfully");
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const weekBookings = useMemo(
    () => getWeekBookings(bookings, weekStart, weekEnd),
    [bookings, weekStart, weekEnd]
  );

  const upcomingBookings = useMemo(
    () => getUpcomingBookings(bookings),
    [bookings]
  );

  const mobileWeekBookings = useMemo(
    () => getWeekBookings(bookings, mobileWeekStart, mobileWeekEnd),
    [bookings, mobileWeekStart, mobileWeekEnd]
  );

  const onSubmit = (values: CreateBookingFormValues) => {
    setCreateErrorMessage(null);
    createMutation.mutate({
      title: values.title.trim(),
      notes: values.notes?.trim() || undefined,
      startTime: new Date(values.startTime).toISOString(),
      endTime: new Date(values.endTime).toISOString(),
    });
  };

  const handleOpenCreateBooking = (baseDate = new Date()) => {
    reset({
      title: "",
      notes: "",
      ...getDefaultBookingDateTimes(baseDate),
    });
    setCreateErrorMessage(null);
    setNewBookingOpen(true);
  };

  const handleDelete = (booking: Booking) => {
    setBookingToDelete(booking);
  };

  const handleConfirmDelete = () => {
    if (!bookingToDelete) {
      return;
    }

    deleteMutation.mutate(bookingToDelete.id);
  };

  const handleCancelCreate = () => {
    reset();
    setCreateErrorMessage(null);
    setNewBookingOpen(false);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setNewBookingOpen(open);

    if (!open && !createMutation.isPending) {
      reset();
      setCreateErrorMessage(null);
    }
  };

  if (userLoading || bookingsLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-[#667085]">Loading bookings...</p>
      </div>
    );
  }

  if (isError || !currentUser) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-red-600">Unable to load bookings.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#101828] lg:text-2xl">
              Bookings
            </h1>
            <p className="mt-2 hidden text-sm text-[#667085] lg:block">
              View and manage room bookings.
            </p>
          </div>

          <Button
            type="button"
            className="hidden h-9 bg-[#0355DD] px-4 text-white hover:bg-[#0248BD] lg:inline-flex"
            onClick={() => handleOpenCreateBooking()}
          >
            <Plus className="size-4" />
            New Booking
          </Button>
        </div>

        <div className="space-y-4 lg:hidden">
          <MobileDateStrip
            selectedDate={mobileSelectedDate}
            onSelectedDateChange={setMobileSelectedDate}
          />

          <MobileBookingAgenda
            bookings={mobileWeekBookings}
            selectedDate={mobileSelectedDate}
            rangeStart={mobileWeekStart}
            rangeEnd={mobileWeekEnd}
            onBookingSelect={setSelectedBooking}
          />

          <WeekSummary
            bookings={mobileWeekBookings}
            weekDays={mobileWeekDays}
          />
        </div>

        <div className="hidden gap-4 lg:grid xl:grid-cols-[minmax(0,1fr)_300px]">
          <WeeklyCalendar
            bookings={weekBookings}
            currentDate={currentDate}
            weekStart={weekStart}
            weekEnd={weekEnd}
            onCurrentDateChange={setCurrentDate}
          />

          <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
            <UpcomingBookingsAccordion
              bookings={upcomingBookings}
              currentUser={currentUser}
              isDeleting={deleteMutation.isPending}
              onDelete={handleDelete}
            />

            <WeekSummary bookings={weekBookings} weekDays={weekDays} />
          </div>
        </div>
      </div>

      <Button
        type="button"
        size="icon"
        className="fixed bottom-6 right-5 z-40 size-14 rounded-full bg-[#0355DD] text-white shadow-lg hover:bg-[#0248BD] lg:hidden"
        aria-label="New booking"
        onClick={() => handleOpenCreateBooking(mobileSelectedDate)}
      >
        <Plus className="size-6" />
      </Button>

      <BookingDetailSheet
        booking={selectedBooking}
        currentUser={currentUser}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBooking(null);
          }
        }}
        onDelete={handleDelete}
      />

      <ConfirmDeleteDialog
        open={Boolean(bookingToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setBookingToDelete(null);
          }
        }}
        title="Delete booking?"
        description={
          bookingToDelete
            ? `Are you sure you want to delete "${bookingToDelete.title}"?\nThis action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Booking"
        isPending={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />

      <Sheet open={newBookingOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          className="w-full max-w-[460px] gap-0 border-[#E4E7EC] bg-[#FFFFFF] p-0 sm:max-w-[460px]"
        >
          <SheetHeader className="border-b border-[#E4E7EC] px-6 py-5">
            <SheetTitle className="text-lg font-semibold text-[#101828]">
              Create New Booking
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm text-[#667085]">
              Choose a date and time for your room booking.
            </SheetDescription>
          </SheetHeader>

          <CreateBookingForm
            errors={errors}
            isSubmitting={createMutation.isPending}
            register={register}
            setValue={setValue}
            handleSubmit={handleSubmit}
            selectedDuration={selectedDuration}
            startTimeValue={startTimeValue ?? ""}
            endTimeValue={endTimeValue ?? ""}
            serverError={createErrorMessage}
            onCancel={handleCancelCreate}
            onSubmit={onSubmit}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
