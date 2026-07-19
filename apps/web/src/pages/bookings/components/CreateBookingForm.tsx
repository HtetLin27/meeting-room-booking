import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { CreateBookingFormValues } from "@/schemas/booking.schema";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  combineLocalDateAndTime,
  formatLocalDateValue,
  formatLocalDateTimeValue,
  parseLocalDateValue,
} from "@/lib/booking-utils";
import { TimePicker } from "@/pages/bookings/components/TimePicker";

type CreateBookingFormProps = {
  errors: FieldErrors<CreateBookingFormValues>;
  isSubmitting: boolean;
  register: UseFormRegister<CreateBookingFormValues>;
  setValue: UseFormSetValue<CreateBookingFormValues>;
  handleSubmit: UseFormHandleSubmit<CreateBookingFormValues>;
  selectedDuration: string | null;
  startTimeValue: string;
  endTimeValue: string;
  serverError: string | null;
  onCancel: () => void;
  onSubmit: (values: CreateBookingFormValues) => void;
};

function getDatePart(dateTimeValue: string) {
  return dateTimeValue.split("T")[0] ?? "";
}

function getTimePart(dateTimeValue: string) {
  return dateTimeValue.split("T")[1]?.slice(0, 5) ?? "";
}

type DatePickerControlProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  align?: "start" | "end";
  showError?: boolean;
  onChange: (value: string) => void;
};

function DatePickerControl({
  id,
  label,
  value,
  error,
  align = "start",
  showError = true,
  onChange,
}: DatePickerControlProps) {
  const selectedDate = useMemo(
    () => (value ? parseLocalDateValue(value) : null),
    [value]
  );
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(selectedDate ?? new Date());

  useEffect(() => {
    if (open) {
      setVisibleMonth(selectedDate ?? new Date());
    }
  }, [open, selectedDate]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm text-[#344054]">
        {label}
      </Label>

      <Popover open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
        <PopoverTrigger
          id={id}
          type="button"
          aria-invalid={Boolean(error)}
          className="inline-flex h-11 w-full items-center justify-start gap-2 rounded-lg border border-[#D0D5DD] bg-white px-3 text-left text-sm font-medium text-[#344054] outline-none transition-colors hover:bg-[#F9FAFB] focus-visible:border-[#0355DD] focus-visible:ring-3 focus-visible:ring-[#0355DD]/15 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20"
        >
          <CalendarIcon className="size-4 shrink-0 text-[#667085]" />
          <span className="min-w-0 flex-1 truncate">
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select date"}
          </span>
          <ChevronDown className="size-4 shrink-0 text-[#667085]" />
        </PopoverTrigger>

        <PopoverContent align={align} className="w-auto">
          <Calendar
            selected={selectedDate ?? undefined}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            onSelect={(date) => {
              onChange(formatLocalDateValue(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {showError && error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function CreateBookingForm({
  errors,
  isSubmitting,
  register,
  setValue,
  handleSubmit,
  selectedDuration,
  startTimeValue,
  endTimeValue,
  serverError,
  onCancel,
  onSubmit,
}: CreateBookingFormProps) {
  const startDate = getDatePart(startTimeValue);
  const startTime = getTimePart(startTimeValue);
  const endDate = getDatePart(endTimeValue);
  const endTime = getTimePart(endTimeValue);
  const safeStartDate = startDate || formatLocalDateValue(new Date());
  const safeStartTime = startTime || "09:00";
  const safeEndDate = endDate || safeStartDate;
  const safeEndTime = endTime || "10:00";

  const setDateTimeValue = (
    field: "startTime" | "endTime",
    dateValue: string,
    timeValue: string
  ) => {
    setValue(field, combineLocalDateAndTime(dateValue, timeValue), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const ensureEndAfterStart = (nextStartValue: string) => {
    const currentEndDate = new Date(endTimeValue);
    const nextStartDate = new Date(nextStartValue);

    if (
      Number.isNaN(currentEndDate.getTime()) ||
      Number.isNaN(nextStartDate.getTime()) ||
      currentEndDate <= nextStartDate ||
      currentEndDate.getTime() - nextStartDate.getTime() > 8 * 60 * 60 * 1000
    ) {
      const nextEndDate = new Date(nextStartDate.getTime() + 60 * 60 * 1000);

      setValue("endTime", formatLocalDateTimeValue(nextEndDate), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  };

  const updateStartDateTime = (dateValue: string, timeValue: string) => {
    const nextStartValue = combineLocalDateAndTime(dateValue, timeValue);

    setValue("startTime", nextStartValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    ensureEndAfterStart(nextStartValue);
  };

  return (
    <form
      id="create-booking-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
        <input type="hidden" {...register("startTime")} />
        <input type="hidden" {...register("endTime")} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#101828]">Start</p>

            <DatePickerControl
              id="start-date"
              label="Start Date"
              value={safeStartDate}
              error={errors.startTime?.message}
              showError={false}
              onChange={(dateValue) =>
                updateStartDateTime(dateValue, safeStartTime)
              }
            />

            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-sm text-[#344054]">
                Start Time
              </Label>

              <TimePicker
                id="start-time"
                value={safeStartTime}
                invalid={Boolean(errors.startTime)}
                onChange={(timeValue) =>
                  updateStartDateTime(safeStartDate, timeValue)
                }
              />

              {errors.startTime && (
                <p className="text-xs text-red-600">
                  {errors.startTime.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#101828]">End</p>

            <DatePickerControl
              id="end-date"
              label="End Date"
              value={safeEndDate}
              error={errors.endTime?.message}
              align="end"
              showError={false}
              onChange={(dateValue) =>
                setDateTimeValue("endTime", dateValue, safeEndTime)
              }
            />

            <div className="space-y-2">
              <Label htmlFor="end-time" className="text-sm text-[#344054]">
                End Time
              </Label>

              <TimePicker
                id="end-time"
                value={safeEndTime}
                invalid={Boolean(errors.endTime)}
                onChange={(timeValue) =>
                  setDateTimeValue("endTime", safeEndDate, timeValue)
                }
              />

              {errors.endTime && (
                <p className="text-xs text-red-600">{errors.endTime.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-h-10 items-center gap-2 rounded-md bg-[#F7F9FC] px-3 text-sm text-[#667085]">
          <Clock className="size-4 text-[#667085]" />
          <span>Duration:</span>
          <span className="font-semibold text-[#0355DD]">
            {selectedDuration ?? "0h 00m"}
          </span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm text-[#344054]">
            Title
          </Label>

          <Input
            id="title"
            placeholder="e.g. Team Meeting"
            className="h-9 border-[#E4E7EC] text-[#344054] placeholder:text-[#98A2B3] focus-visible:border-[#0355DD] focus-visible:ring-[#0355DD]/15"
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />

          {errors.title && (
            <p className="text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm text-[#344054]">
            Notes <span className="text-[#667085]">(Optional)</span>
          </Label>

          <Textarea
            id="notes"
            rows={5}
            placeholder="Add any notes..."
            className="min-h-24 resize-none border-[#E4E7EC] text-[#344054] placeholder:text-[#98A2B3] focus-visible:border-[#0355DD] focus-visible:ring-[#0355DD]/15"
            aria-invalid={Boolean(errors.notes)}
            {...register("notes")}
          />

          {errors.notes && (
            <p className="text-xs text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-end gap-3 border-t border-[#E4E7EC] px-6 py-4">
        <Button
          type="button"
          variant="outline"
          className="h-9 border-[#E4E7EC] px-4 text-[#344054] hover:bg-[#F9FAFB]"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="h-9 bg-[#0355DD] px-4 text-white hover:bg-[#0248BD]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}
