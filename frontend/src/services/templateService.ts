import { apiRequest } from "./api";
import type { PageResponse, TemplateItem } from "../types";

export function fetchTemplates() {
  return apiRequest<PageResponse<TemplateItem>>("/templates/");
}

export function createTemplate(payload: Partial<TemplateItem>) {
  return apiRequest<TemplateItem>("/templates/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTemplate(id: number, payload: Partial<TemplateItem>) {
  return apiRequest<TemplateItem>(`/templates/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTemplate(id: number) {
  return apiRequest<void>(`/templates/${id}/`, {
    method: "DELETE",
  });
}
