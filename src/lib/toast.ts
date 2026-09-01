import React from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

export type ToastOptions = ExternalToast;

function formatDescriptionOrOptions(
  secondArg?: string | ToastOptions
): ToastOptions | undefined {
  if (!secondArg) return undefined;
  if (typeof secondArg === "string") {
    return { description: secondArg };
  }
  return secondArg;
}

function extractErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object") {
    if ("error" in error && typeof (error as any).error === "string") {
      return (error as any).error;
    }
    if ("message" in error && typeof (error as any).message === "string") {
      return (error as any).message;
    }
  }
  return String(error);
}

/**
 * Smart Toast utility for DeRoma.
 * Compatible with Sonner standard API + dual-string legacy calls `toast.success(msg, title)`.
 */
export const toast = {
  success: (message: string, secondArg?: string | ToastOptions) => {
    return sonnerToast.success(message, formatDescriptionOrOptions(secondArg));
  },

  error: (errorOrMessage: unknown, secondArg?: string | ToastOptions) => {
    const msg = extractErrorMessage(errorOrMessage);
    return sonnerToast.error(msg, formatDescriptionOrOptions(secondArg));
  },

  warning: (message: string, secondArg?: string | ToastOptions) => {
    return sonnerToast.warning(message, formatDescriptionOrOptions(secondArg));
  },

  info: (message: string, secondArg?: string | ToastOptions) => {
    return sonnerToast.info(message, formatDescriptionOrOptions(secondArg));
  },

  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, options);
  },

  message: (message: string, options?: ToastOptions) => {
    return sonnerToast.message(message, options);
  },

  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    data: Parameters<typeof sonnerToast.promise>[1]
  ) => {
    return sonnerToast.promise(promise, data);
  },

  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id);
  },

  custom: (
    jsx: (id: number | string) => React.ReactElement,
    data?: ToastOptions
  ) => {
    return sonnerToast.custom(jsx, data);
  },
};

export default toast;
