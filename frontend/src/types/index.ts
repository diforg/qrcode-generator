export interface QrFormState {
  targetUrl: string;
  fgColor: string;
  bgColor: string;
  dotStyle: "square" | "rounded" | "dots";
  errorCorrection: "L" | "M" | "Q" | "H";
  logoBase64: string | null;
  exportFormat: "PNG" | "SVG";
  resolution: number;
}

export interface PreviewResponse {
  image: string;
}

export interface HistoryItem {
  id: number;
  target_url: string;
  fg_color: string;
  bg_color: string;
  has_logo: boolean;
  export_format: "PNG" | "SVG";
  resolution: number;
  created_at: string;
}