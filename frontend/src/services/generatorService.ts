import { apiBlobRequest, apiRequest } from "./api";
import type { PreviewResponse, QrFormState } from "../types";


function mapPayload(state: QrFormState) {
  return {
    target_url: state.targetUrl,
    fg_color: state.fgColor,
    bg_color: state.bgColor,
    dot_style: state.dotStyle,
    error_correction: state.errorCorrection,
    logo_base64: state.logoBase64,
    export_format: state.exportFormat,
    resolution: state.resolution,
  };
}


export function requestPreview(state: QrFormState) {
  return apiRequest<PreviewResponse>("/generator/preview/", {
    method: "POST",
    body: JSON.stringify(mapPayload(state)),
  });
}

export function requestDownload(state: QrFormState) {
  return apiBlobRequest("/generator/generate/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapPayload(state)),
  });
}