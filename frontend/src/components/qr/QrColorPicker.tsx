interface QrColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}


export function QrColorPicker({ label, value, onChange }: QrColorPickerProps) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="flex items-center gap-3">
        <span className="text-sm font-semibold text-ink">{value.toUpperCase()}</span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-10 cursor-pointer rounded-full border-0 bg-transparent p-0"
        />
      </span>
    </label>
  );
}