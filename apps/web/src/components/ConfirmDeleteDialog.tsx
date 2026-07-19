import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  isPending = false,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (isPending) {
      return;
    }

    onOpenChange(nextOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <div className="flex size-11 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="size-5 text-red-600" />
        </div>

        <div className="space-y-2">
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription className="whitespace-pre-line">
            {description}
          </AlertDialogDescription>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AlertDialogCancel
            render={
              <Button
                type="button"
                variant="outline"
                className="h-10 border-[#D0D5DD] px-4 text-[#344054] hover:bg-[#F9FAFB]"
                disabled={isPending}
              />
            }
          >
            Cancel
          </AlertDialogCancel>

          <Button
            type="button"
            className="h-10 bg-red-600 px-4 text-white hover:bg-red-700"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
