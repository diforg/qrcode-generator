import { QrCanvasPreview } from "../components/qr/QrCanvasPreview";
import { QrColorPicker } from "../components/qr/QrColorPicker";
import { QrExportButtons } from "../components/qr/QrExportButtons";
import { QrLogoUploader } from "../components/qr/QrLogoUploader";
import { useQrGenerator } from "../hooks/useQrGenerator";


export function GeneratorPage() {
  const { form, setForm, preview, loadingPreview, downloading, error, downloadQr } = useQrGenerator();

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