const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8001/api";

function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("qrcode-generator-auth");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      access?: string;
      refresh?: string;
      tokens?: { access?: string; refresh?: string } | null;
    } | null;

    return parsed?.tokens?.access ?? parsed?.access ?? null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Sua sessão expirou ou não foi autenticada. Faça login novamente.");
    }

    const rawText = await response.text();
    let message = "Falha na requisicao.";

    if (rawText) {
      try {
        const payload = JSON.parse(rawText) as { detail?: string; message?: string };
        message = payload.detail || payload.message || rawText;
      } catch {
        message = rawText;
      }
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function apiBlobRequest(path: string, init?: RequestInit): Promise<Blob> {
  const token = getStoredAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Sua sessão expirou ou não foi autenticada. Faça login novamente.");
    }
    throw new Error("Falha ao gerar o arquivo.");
  }
  return response.blob();
}