export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] space-y-4">
      <div className="relative w-12 h-12">
        {/* Outer Pulsing Glow */}
        <div className="absolute inset-0 rounded-full border-4 border-violet-100 animate-pulse"></div>
        {/* Inner Fast Spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 animate-spin"></div>
      </div>
      <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase animate-pulse">
        Loading Data
      </p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200/70 rounded-xl ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3.5 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-20 rounded-2xl" />
      </div>
      <div className="space-y-3.5">
        {/* Header Row */}
        <div className="flex gap-4 border-b border-gray-100 pb-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {/* Body Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
