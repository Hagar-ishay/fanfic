import { TableSkeleton } from "@/components/base/StreamingWrapper";

export default function Loading() {
  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-background w-full min-h-full overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8 pb-12 max-w-full sm:max-w-7xl sm:mx-auto">
        <div className="space-y-4 w-full max-w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <TableSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}