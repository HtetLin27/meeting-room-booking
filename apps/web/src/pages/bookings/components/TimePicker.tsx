import { ChevronDown, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TimePickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
};

type TimeParts = {
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

const HOURS = Array.from({ length: 12 }, (_, index) =>
  (index + 1).toString().padStart(2, "0")
);
const MINUTES = ["00", "15", "30", "45"];
const PERIODS = ["AM", "PM"] as const;

function normalizeMinute(minute: string) {
  if (MINUTES.includes(minute)) {
    return minute;
  }

  const numericMinute = Number(minute);
  const nearestMinute = Math.round(numericMinute / 15) * 15;

  return (nearestMinute % 60).toString().padStart(2, "0");
}

function parseTimeValue(value: string): TimeParts {
  const [hoursValue = "09", minutesValue = "00"] = value.split(":");
  const hours24 = Number(hoursValue);
  const safeHours24 = Number.isFinite(hours24) ? hours24 : 9;
  const period = safeHours24 >= 12 ? "PM" : "AM";
  const hour = (safeHours24 % 12 || 12).toString().padStart(2, "0");

  return {
    hour,
    minute: normalizeMinute(minutesValue),
    period,
  };
}

function convertTo24HourTime({ hour, minute, period }: TimeParts) {
  const hourNumber = Number(hour);
  const hours24 =
    period === "PM"
      ? hourNumber === 12
        ? 12
        : hourNumber + 12
      : hourNumber === 12
        ? 0
        : hourNumber;

  return `${hours24.toString().padStart(2, "0")}:${minute}`;
}

function formatTimeForDisplay(parts: TimeParts) {
  return `${parts.hour}:${parts.minute} ${parts.period}`;
}

type TimeButtonGridProps = {
  label: string;
  values: readonly string[];
  selectedValue: string;
  columns: string;
  onSelect: (value: string) => void;
};

function TimeButtonGrid({
  label,
  values,
  selectedValue,
  columns,
  onSelect,
}: TimeButtonGridProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#667085]">{label}</p>

      <div className={cn("grid gap-1.5", columns)}>
        {values.map((value) => {
          const isSelected = value === selectedValue;

          return (
            <button
              key={value}
              type="button"
              aria-pressed={isSelected}
              className={cn(
                "flex h-8 items-center justify-center rounded-lg text-[13px] font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-[#0355DD]/15",
                isSelected
                  ? "bg-[#0355DD] text-white shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                  : "bg-[#F9FAFB] text-[#344054] hover:bg-[#EEF5FF] hover:text-[#0355DD]"
              )}
              onClick={() => onSelect(value)}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimePicker({
  id,
  value,
  onChange,
  disabled,
  invalid,
}: TimePickerProps) {
  const currentTime = useMemo(() => parseTimeValue(value), [value]);
  const [open, setOpen] = useState(false);
  const [draftTime, setDraftTime] = useState<TimeParts>(currentTime);

  useEffect(() => {
    if (!open) {
      setDraftTime(currentTime);
    }
  }, [currentTime, open]);

  const updateDraft = (nextTime: Partial<TimeParts>) => {
    setDraftTime((currentDraft) => ({
      ...currentDraft,
      ...nextTime,
    }));
  };

  const closeWithoutSaving = () => {
    setDraftTime(currentTime);
    setOpen(false);
  };

  const saveDraft = () => {
    onChange(convertTo24HourTime(draftTime));
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (disabled) {
          return;
        }

        if (nextOpen) {
          setDraftTime(currentTime);
        }

        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={invalid}
        aria-label={`Select time ${formatTimeForDisplay(currentTime)}`}
        className={cn(
          "inline-flex h-11 w-full items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-3 text-sm font-semibold text-[#344054] outline-none transition-colors hover:bg-[#F9FAFB] focus-visible:border-[#0355DD] focus-visible:ring-3 focus-visible:ring-[#0355DD]/15 data-open:border-[#0355DD] data-open:ring-3 data-open:ring-[#0355DD]/15",
          invalid && "border-red-500 ring-3 ring-red-500/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Clock className="size-4 shrink-0 text-[#667085]" />

        <span className="min-w-0 flex-1 truncate text-left">
          {formatTimeForDisplay(currentTime)}
        </span>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[#667085] transition-transform",
            open && "rotate-180"
          )}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        collisionPadding={12}
        className="w-[min(280px,calc(100vw-24px))] rounded-[14px] border-[#D0D5DD] p-0 shadow-[0_12px_32px_rgba(16,24,40,0.12)]"
      >
        <div className="space-y-3 p-3">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F9FAFB] p-1">
            {PERIODS.map((period) => {
              const isSelected = draftTime.period === period;

              return (
                <button
                  key={period}
                  type="button"
                  className={cn(
                    "h-9 rounded-lg text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-[#0355DD]/15",
                    isSelected
                      ? "bg-[#EEF5FF] text-[#0355DD] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      : "text-[#667085] hover:bg-white"
                  )}
                  onClick={() => updateDraft({ period })}
                >
                  {period}
                </button>
              );
            })}
          </div>

          <TimeButtonGrid
            label="Hour"
            values={HOURS}
            selectedValue={draftTime.hour}
            columns="grid-cols-6"
            onSelect={(hour) => updateDraft({ hour })}
          />

          <TimeButtonGrid
            label="Minute"
            values={MINUTES}
            selectedValue={draftTime.minute}
            columns="grid-cols-4"
            onSelect={(minute) => updateDraft({ minute })}
          />
        </div>

        <div className="grid grid-cols-2 border-t border-[#E4E7EC]">
          <button
            type="button"
            className="h-11 border-r border-[#E4E7EC] text-sm font-semibold text-[#667085] outline-none transition-colors hover:bg-[#F9FAFB] focus-visible:ring-3 focus-visible:ring-[#0355DD]/15"
            onClick={closeWithoutSaving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="h-11 text-sm font-semibold text-[#0355DD] outline-none transition-colors hover:bg-[#EEF5FF] focus-visible:ring-3 focus-visible:ring-[#0355DD]/15"
            onClick={saveDraft}
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
