import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { fetchTemplates } from "../services/templateService";
import type { TemplateItem } from "../types";

export function DashboardPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setLoading(true);
        const response = await fetchTemplates();
        setTemplates(response.results);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar os templates.");
      } finally {
        setLoading(false);
      }
    }

    void loadTemplates();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-ember">Dashboard</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink">Templates salvos</h1>
        </div>
        <Link to="/generator" className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
          Novo QR
        </Link>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500 shadow-soft">
          Carregando templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-soft">
          Nenhum template cadastrado ainda. Crie seu primeiro modelo no gerador.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article key={template.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                  {template.dot_style}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {template.error_correction}
                </span>
              </div>

              <h2 className="font-display text-2xl font-bold text-ink">{template.name}</h2>

              <div className="mt-4 flex items-center gap-3">
                <span className="inline-block h-7 w-7 rounded-full border border-slate-200" style={{ backgroundColor: template.fg_color }} />
                <span className="inline-block h-7 w-7 rounded-full border border-slate-200" style={{ backgroundColor: template.bg_color }} />
              </div>

              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <p>Estilo: {template.dot_style}</p>
                <p>Correção: {template.error_correction}</p>
                <p>Atualizado em: {new Date(template.updated_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}