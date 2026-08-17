import { useEffect, useRef, useState } from "react";

import { requestDownload, requestPreview } from "../services/generatorService";
import type { QrFormState } from "../types";


const defaultState: QrFormState = {
  targetUrl: "https://example.com",
  fgColor: "#0f172a",
  bgColor: "#ffffff",
  dotStyle: "rounded",
  errorCorrection: "H",
  logoBase64: null,
  exportFormat: "PNG",
  resolution: 1024,
};


export function useQrGenerator() {
  const [form, setForm] = useState<QrFormState>(defaultState);
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!form.targetUrl) {
      return;
    }

    setLoadingPreview(true);
    setError(null);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(async () => {
      try {
        const response = await requestPreview(form);
        setPreview(response.image);
      } catch (previewError) {
        setError(previewError instanceof Error ? previewError.message : "Nao foi possivel gerar o preview.");
      } finally {
        setLoadingPreview(false);
      }
    }, 400);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [form]);

  async function downloadQr(format: "PNG" | "SVG") {
    setDownloading(true);
    setError(null);
    try {
      const blob = await requestDownload({ ...form, exportFormat: format });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `qrcode.${format.toLowerCase()}`;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Nao foi possivel baixar o QR Code.");
    } finally {
      setDownloading(false);
    }
  }

  return {
    form,
    setForm,
    preview,
    loadingPreview,
    downloading,
    error,
    downloadQr,
  };
}