import { CardSkeleton, TableSkeleton, Skeleton } from "@/app/components/ui";

export default function Loading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={4} cols={5} />
    </div>
  );
}
