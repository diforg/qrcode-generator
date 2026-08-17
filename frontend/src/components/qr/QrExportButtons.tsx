interface QrExportButtonsProps {
  loading: boolean;
  onExport: (format: "PNG" | "SVG") => void;
}


export function QrExportButtons({ loading, onExport }: QrExportButtonsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => onExport("PNG")}
        disabled={loading}
        className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Gerando..." : "Baixar PNG"}
      </button>
      <button
        type="button"
        onClick={() => onExport("SVG")}
        disabled={loading}
        className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
      >
        Baixar SVG
      </button>
    </div>
  );
}