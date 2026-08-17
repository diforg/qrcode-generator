import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { deleteHistoryItem, fetchHistory } from "../services/historyService";
import type { HistoryItem } from "../types";

export function HistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshHistory() {
    try {
      setLoading(true);
      const response = await fetchHistory();
      setItems(response.results);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Nao foi possivel carregar o historico.";
      if (message.includes("sessao") || message.includes("autenticada")) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void refreshHistory();
  }, [isAuthenticated, navigate, logout]);

  async function handleDelete(id: number) {
    try {
      await deleteHistoryItem(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Nao foi possivel remover o item.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-lake">Historico</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink">Geracoes recentes</h1>
        </div>
        <Link to="/generator" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-ink transition hover:border-ink">
          Voltar ao gerador
        </Link>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-500 shadow-soft">
          Carregando historico...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-soft">
          Nenhuma geracao salva no historico ainda.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {item.template_id ? "Template salvo" : "Geração direta"}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-ink">{item.target_url}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span>Res: {item.resolution}px</span>
                  <span>•</span>
                  <span>{item.export_format}</span>
                  <span>•</span>
                  <span>{new Date(item.created_at).toLocaleString("pt-BR")}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-block h-6 w-6 rounded-full border border-slate-200" style={{ backgroundColor: item.fg_color }} />
                <span className="inline-block h-6 w-6 rounded-full border border-slate-200" style={{ backgroundColor: item.bg_color }} />
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}