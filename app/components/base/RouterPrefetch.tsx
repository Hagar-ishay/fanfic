"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Preload critical routes on app startup
const CRITICAL_ROUTES = ['/home', '/library', '/explore', '/settings'];

export function RouterPrefetch() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch critical routes after a short delay
    const timer = setTimeout(() => {
      CRITICAL_ROUTES.forEach(route => {
        router.prefetch(route);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return null;
}