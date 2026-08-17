import type { FormEvent } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  isSubmitting?: boolean;
}

export function AuthCard({ title, subtitle, submitLabel, onSubmit, children, isSubmitting = false }: AuthCardProps) {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-lake">Conta</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">{title}</h1>
        <p className="mt-4 text-slate-600">{subtitle}</p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          {children}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Processando..." : submitLabel}
          </button>
        </form>
      </div>
    </main>
  );
}
