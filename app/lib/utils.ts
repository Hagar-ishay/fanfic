import { AO3_LINK } from "@/consts";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getFanficFromUrl(url: string) {
	return url.toString().replace(`${AO3_LINK}/works/`, "").split("/")[0] ?? "";
}
