export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <h3 className="text-2xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      {action}
    </div>
  );
}
