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

export interface PageResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TemplateItem {
  id: number;
  name: string;
  fg_color: string;
  bg_color: string;
  logo_image: string | null;
  dot_style: "square" | "rounded" | "dots";
  error_correction: "L" | "M" | "Q" | "H";
  created_at: string;
  updated_at: string;
}

export interface HistoryItem {
  id: number;
  template_id?: number | null;
  target_url: string;
  fg_color: string;
  bg_color: string;
  has_logo: boolean;
  export_format: "PNG" | "SVG";
  resolution: number;
  created_at: string;
}