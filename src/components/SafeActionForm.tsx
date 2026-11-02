"use client";

import { forwardRef, type FormHTMLAttributes, type ReactNode } from "react";
import { useToast } from "@/providers/ToastProvider";

type SafeActionResult = { error?: unknown } | void;
type SafeAction = (formData: FormData) => Promise<SafeActionResult>;

type SafeActionFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action" | "onError"> & {
  action?: SafeAction;
  children: ReactNode;
  onSuccess?: (formData: FormData) => void;
  onError?: (message: string) => void;
};

function isRedirectError(error: unknown) {
  if (!error || typeof error !== "object" || !("digest" in error)) return false;
  return String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT");
}

const SafeActionForm = forwardRef<HTMLFormElement, SafeActionFormProps>(function SafeActionForm(
  { action, children, onSuccess, onError, ...props },
  ref,
) {
  const { toast } = useToast();

  const safeAction = async (formData: FormData) => {
    try {
      if (!action) return;
      const result = await action(formData);
      if (result && typeof result === "object" && "error" in result && result.error) {
        const message = String(result.error);
        toast.error(message, "ACTION FAILED");
        onError?.(message);
        return;
      }
      onSuccess?.(formData);
    } catch (error) {
      if (isRedirectError(error)) throw error;
      const message = error instanceof Error && error.message ? error.message : "Something went wrong. Please try again.";
      toast.error(message, "ACTION FAILED");
      onError?.(message);
    }
  };

  return (
    <form ref={ref} {...props} action={safeAction}>
      {children}
    </form>
  );
});

export default SafeActionForm;
