import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { QrCanvasPreview } from "../components/qr/QrCanvasPreview";
import { QrColorPicker } from "../components/qr/QrColorPicker";
import { QrExportButtons } from "../components/qr/QrExportButtons";
import { QrLogoUploader } from "../components/qr/QrLogoUploader";
import { useQrGenerator } from "../hooks/useQrGenerator";
import { createTemplate, updateTemplate } from "../services/templateService";
import type { HistoryItem, TemplateItem } from "../types";

export function GeneratorPage() {
  const location = useLocation();
  const { form, setForm, preview, loadingPreview, downloading, error, downloadQr } = useQrGenerator();
  const [templateName, setTemplateName] = useState("Meu template");
  const [templateStatus, setTemplateStatus] = useState<string | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  useEffect(() => {
    const state = location.state as { template?: TemplateItem; historyItem?: HistoryItem } | null;
    const template = state?.template;
    const historyItem = state?.historyItem;

    if (template) {
      setForm((current) => ({
        ...current,
        targetUrl: current.targetUrl,
        fgColor: template.fg_color,
        bgColor: template.bg_color,
        dotStyle: template.dot_style,
        errorCorrection: template.error_correction,
      }));
      setSelectedTemplateId(template.id);
      setTemplateName(template.name);
      setTemplateStatus(`Modelo "${template.name}" carregado.`);
      return;
    }

    if (historyItem) {
      setForm((current) => ({
        ...current,
        targetUrl: historyItem.target_url,
        fgColor: historyItem.fg_color,
        bgColor: historyItem.bg_color,
        exportFormat: historyItem.export_format,
        resolution: historyItem.resolution,
      }));
      setSelectedTemplateId(null);
      setTemplateName("Geracao recente");
      setTemplateStatus("Configuracao reaproveitada do historico.");
    }
  }, [location.state, setForm]);

  async function handleSaveTemplate() {
    const name = templateName.trim();
    if (!name) {
      setTemplateStatus("Informe um nome para salvar o template.");
      return;
    }

    try {
      setSavingTemplate(true);
      setTemplateStatus(null);

      if (selectedTemplateId) {
        await updateTemplate(selectedTemplateId, {
          name,
          fg_color: form.fgColor,
          bg_color: form.bgColor,
          dot_style: form.dotStyle,
          error_correction: form.errorCorrection,
        });
        setTemplateStatus("Template atualizado com sucesso.");
      } else {
        await createTemplate({
          name,
          fg_color: form.fgColor,
          bg_color: form.bgColor,
          dot_style: form.dotStyle,
          error_correction: form.errorCorrection,
        });
        setTemplateStatus("Template salvo com sucesso.");
      }
    } catch (saveError) {
      setTemplateStatus(saveError instanceof Error ? saveError.message : "Nao foi possivel salvar o template.");
    } finally {
      setSavingTemplate(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[1fr_420px]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-ember">Gerador</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-ink">Configure o QR Code</h1>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">API /preview + /generate</div>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-600">URL de destino</span>
            <input
              type="url"
              value={form.targetUrl}
              onChange={(event) => setForm((current) => ({ ...current, targetUrl: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-ink outline-none transition focus:border-ember"
              placeholder="https://seusite.com"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <QrColorPicker
              label="Cor principal"
              value={form.fgColor}
              onChange={(value) => setForm((current) => ({ ...current, fgColor: value }))}
            />
            <QrColorPicker
              label="Cor de fundo"
              value={form.bgColor}
              onChange={(value) => setForm((current) => ({ ...current, bgColor: value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-600">Estilo</span>
              <select
                value={form.dotStyle}
                onChange={(event) => setForm((current) => ({ ...current, dotStyle: event.target.value as "square" | "rounded" | "dots" }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-ink outline-none focus:border-ember"
              >
                <option value="square">Quadrado</option>
                <option value="rounded">Arredondado</option>
                <option value="dots">Pontos</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-600">Correcao</span>
              <select
                value={form.errorCorrection}
                onChange={(event) => setForm((current) => ({ ...current, errorCorrection: event.target.value as "L" | "M" | "Q" | "H" }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-ink outline-none focus:border-ember"
              >
                <option value="L">L</option>
                <option value="M">M</option>
                <option value="Q">Q</option>
                <option value="H">H</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-600">Resolucao</span>
              <select
                value={form.resolution}
                onChange={(event) => setForm((current) => ({ ...current, resolution: Number(event.target.value) }))}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-ink outline-none focus:border-ember"
              >
                <option value={512}>512 px</option>
                <option value={1024}>1024 px</option>
                <option value={2048}>2048 px</option>
              </select>
            </label>
          </div>

          <QrLogoUploader
            logoBase64={form.logoBase64}
            onChange={(value) => setForm((current) => ({ ...current, logoBase64: value }))}
          />

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-600">Nome do template</span>
              <input
                type="text"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-ember"
                placeholder="Ex: Produto X"
              />
            </label>

            <button
              type="button"
              onClick={() => void handleSaveTemplate()}
              disabled={savingTemplate}
              className="mt-4 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingTemplate ? "Salvando..." : selectedTemplateId ? "Atualizar template" : "Salvar template"}
            </button>

            {templateStatus ? <p className="mt-3 text-sm text-slate-600">{templateStatus}</p> : null}
          </div>

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

          <QrExportButtons loading={downloading} onExport={downloadQr} />
        </div>
      </section>

      <aside>
        <QrCanvasPreview image={preview} loading={loadingPreview} />
      </aside>
    </main>
  );
}