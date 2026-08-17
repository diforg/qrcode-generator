interface QrCanvasPreviewProps {
  image: string | null;
  loading: boolean;
}


export function QrCanvasPreview({ image, loading }: QrCanvasPreviewProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Preview</p>
          <h3 className="font-display text-2xl font-bold text-ink">Visual em tempo real</h3>
        </div>
        {loading ? <span className="text-sm text-slate-500">Atualizando...</span> : null}
      </div>
      <div className="flex min-h-[320px] items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-sand to-white p-6">
        {image ? (
          <img src={image} alt="Preview do QR Code" className="w-full max-w-[320px] rounded-2xl bg-white p-4" />
        ) : (
          <p className="max-w-xs text-center text-slate-500">O preview aparece aqui assim que a API validar a URL e montar o QR Code.</p>
        )}
      </div>
    </div>
  );
}