export function isMobileDevice() {
	if (typeof window === "undefined") {
		return false; // Running in an SSR environment or without window context.
	}
	return /Mobi|Android/i.test(navigator.userAgent);
}
