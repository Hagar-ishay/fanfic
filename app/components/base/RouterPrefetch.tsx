"use client";

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Preload critical routes on app startup
const CRITICAL_ROUTES = ['/home', '/library', '/explore', '/settings'];

export function RouterPrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  const prefetchRoutes = useCallback(() => {
    CRITICAL_ROUTES.forEach(route => {
      if (route !== pathname) { // Don't prefetch current route
        try {
          router.prefetch(route);
        } catch (error) {
          console.warn(`Failed to prefetch route: ${route}`, error);
        }
      }
    });
  }, [router, pathname]);

  useEffect(() => {
    // Prefetch critical routes after a short delay
    const timer = setTimeout(prefetchRoutes, 100);
    return () => clearTimeout(timer);
  }, [prefetchRoutes]);

  // Enhanced hover prefetching for better navigation experience
  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target;
      
      // Check if target is an Element and has the closest method
      if (!(target && target instanceof Element && typeof target.closest === 'function')) {
        return;
      }
      
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link?.href && link.href.startsWith(window.location.origin)) {
        const url = new URL(link.href);
        if (url.pathname !== pathname) {
          router.prefetch(url.pathname);
        }
      }
    };

    // Use capture phase for better performance
    document.addEventListener('mouseenter', handleMouseEnter, { 
      capture: true, 
      passive: true 
    });
    
    return () => document.removeEventListener('mouseenter', handleMouseEnter, { 
      capture: true 
    });
  }, [router, pathname]);

  return null;
}