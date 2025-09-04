import { CardSkeleton } from "@/components/base/StreamingWrapper";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 pt-8 pb-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted/60 rounded w-1/2"></div>
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}