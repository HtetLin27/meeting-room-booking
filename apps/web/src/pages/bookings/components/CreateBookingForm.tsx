import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";

import type { CreateBookingFormValues } from "@/schemas/booking.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CreateBookingFormProps = {
  errors: FieldErrors<CreateBookingFormValues>;
  isSubmitting: boolean;
  register: UseFormRegister<CreateBookingFormValues>;
  handleSubmit: UseFormHandleSubmit<CreateBookingFormValues>;
  selectedDuration: string | null;
  serverError: string | null;
  onCancel: () => void;
  onSubmit: (values: CreateBookingFormValues) => void;
};

export function CreateBookingForm({
  errors,
  isSubmitting,
  register,
  handleSubmit,
  selectedDuration,
  serverError,
  onCancel,
  onSubmit,
}: CreateBookingFormProps) {
  return (
    <form
      id="create-booking-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-2">
        <div className="space-y-2">
          <Label htmlFor="startTime" className="text-sm text-[#344054]">
            Start Time
          </Label>

          <Input
            id="startTime"
            type="datetime-local"
            className="h-9 border-[#E4E7EC] text-[#344054] focus-visible:border-[#0355DD] focus-visible:ring-[#0355DD]/15"
            aria-invalid={Boolean(errors.startTime)}
            {...register("startTime")}
          />

          {errors.startTime && (
            <p className="text-xs text-red-600">{errors.startTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime" className="text-sm text-[#344054]">
            End Time
          </Label>

          <Input
            id="endTime"
            type="datetime-local"
            className="h-9 border-[#E4E7EC] text-[#344054] focus-visible:border-[#0355DD] focus-visible:ring-[#0355DD]/15"
            aria-invalid={Boolean(errors.endTime)}
            {...register("endTime")}
          />

          {errors.endTime && (
            <p className="text-xs text-red-600">{errors.endTime.message}</p>
          )}
        </div>

        <div className="text-sm text-[#667085]">
          Duration:{" "}
          <span className="font-semibold text-[#239650]">
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
