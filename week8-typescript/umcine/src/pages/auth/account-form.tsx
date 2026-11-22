import type { ComponentProps, ReactNode } from "react";

export const primaryButton = "rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500";

export function AccountPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-96">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">{title}</h1>
        {children}
      </section>
    </main>
  );
}

export function AccountField({ label, id, error, action, icon, hint, ...props }: ComponentProps<"input"> & {
  label: string; id: string; error?: string; action?: ReactNode; icon?: string; hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-800" htmlFor={id}>{label}</label>
      <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 focus-within:ring-2 focus-within:ring-blue-500">
        {icon && <img src={icon} alt="" className="mr-2 size-4 opacity-60" />}
        <input {...props} id={id} aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400" />
        {action}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
