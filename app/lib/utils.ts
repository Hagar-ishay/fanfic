import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { DateTime } from "luxon";
import { AxiosError } from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const errorMessage = (error: unknown) => {
  return (
    (typeof error === "string" && error) ||
    (error instanceof AxiosError && error.response?.data.error_message) ||
    (error instanceof Error && error.message) ||
    ""
  );
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
  ["ru", "ja", "zh", "ko"].includes(langCode || "en") ? "font-wenkai text-xl" : "font-blokletters";

export const debounce = <T extends (...args: any[]) => any>(fn: T, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};
