import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { DateTime } from "luxon";
import { AxiosError } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const errorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as unknown;
    if (
      data &&
      typeof data === "object" &&
      "error_message" in data &&
      typeof (data as { error_message: unknown }).error_message === "string"
    ) {
      return (data as { error_message: string }).error_message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "";
};

export const getIsDesktop = () => useMediaQuery("(min-width: 768px)");

export function capitalize(word: string) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

export const formatDate = (date: Date | null) => {
  if (!date) return "N/A";
  return DateTime.fromJSDate(date).toRelative();
};

export const getFont = (langCode: string | null) =>
  ["ru", "ja", "zh", "ko"].includes(langCode || "en")
    ? "font-wenkai text-xl"
    : "font-blokletters";

export const debounce = <T extends (...args: never[]) => unknown>(
  fn: T,
  ms = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
};
