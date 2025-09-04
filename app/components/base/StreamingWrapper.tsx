import { Suspense } from 'react';

interface StreamingWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function StreamingWrapper({ 
  children, 
  fallback = <div className="animate-pulse bg-muted h-20 rounded" />,
  className 
}: StreamingWrapperProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
}

// Specialized loading components
export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted/60 rounded w-1/2 mt-1"></div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-muted rounded-lg mb-4"></div>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-muted/60 rounded w-1/2"></div>
    </div>
  );
}