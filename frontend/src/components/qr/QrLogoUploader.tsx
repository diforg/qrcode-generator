interface QrLogoUploaderProps {
  logoBase64: string | null;
  onChange: (value: string | null) => void;
}


export function QrLogoUploader({ logoBase64, onChange }: QrLogoUploaderProps) {
  async function handleFile(file: File | null) {
    if (!file) {
      onChange(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Logotipo central</p>
          <p className="text-sm text-slate-500">Envie um PNG com transparencia para testar o overlay.</p>
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
          className="block text-sm text-slate-500"
        />
      </div>
      {logoBase64 ? (
        <img src={logoBase64} alt="Logo selecionado" className="mt-4 h-16 w-16 rounded-xl border border-slate-200 bg-white object-contain p-2" />
      ) : null}
    </div>
  );
}