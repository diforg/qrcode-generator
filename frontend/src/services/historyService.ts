import { apiRequest } from "./api";
import type { HistoryItem, PageResponse } from "../types";

export function fetchHistory() {
  return apiRequest<PageResponse<HistoryItem>>("/generator/history/");
}

export function deleteHistoryItem(id: number) {
  return apiRequest<void>(`/generator/history/${id}/`, {
    method: "DELETE",
  });
}
