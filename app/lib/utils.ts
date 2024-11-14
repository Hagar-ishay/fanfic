import { AO3_LINK } from "@/consts";
import { type ClassValue, clsx } from "clsx";
import React, { createContext, useContext, useState } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export function isMobileDevice() {
	if (typeof window === "undefined") {
		return false; // Running in an SSR environment or without window context.
	}
	return /Mobi|Android/i.test(navigator.userAgent);
}

// biome-ignore lint/suspicious/noExplicitAny: temp
export function parseFanfic(fanfic: any) {
	return {
		...fanfic,
		creationTime: new Date(fanfic.creationTime),
		createdAt: new Date(fanfic.createdAt),
		updatedAt: new Date(fanfic.updatedAt),
		completedAt: fanfic.completedAt ? new Date(fanfic.completedAt) : null,
		updateTime: fanfic.updateTime ? new Date(fanfic.updateTime) : null,
		lastSent: fanfic.lastSent ? new Date(fanfic.lastSent) : null,
	};
}

export function getFanficFromUrl(url: string) {
	return url.toString().replace(`${AO3_LINK}/works/`, "").split("/")[0] ?? "";
}
