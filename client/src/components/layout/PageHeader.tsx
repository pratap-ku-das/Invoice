export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 sm:mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
      <div>
        <h1 className="text-lg font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">{actions}</div>}
    </div>
  );
}
