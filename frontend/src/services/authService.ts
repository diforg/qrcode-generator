import { apiRequest } from "./api";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    auth_provider: string;
  };
  access: string;
  refresh: string;
  tokens: {
    access: string;
    refresh: string;
  };
}

export function loginUser(credentials: AuthCredentials) {
  return apiRequest<AuthResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser() {
  return apiRequest<{ id: number; email: string; username: string; first_name: string; last_name: string; avatar_url: string | null; auth_provider: string }>("/auth/me/");
}
export function requestPasswordReset(email: string) {
  return apiRequest<{ message: string; uid?: string; token?: string }>("/auth/password-reset/request/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordReset(payload: { uid: string; token: string; password: string; password_confirm: string }) {
  return apiRequest<{ message: string }>("/auth/password-reset/confirm/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function socialLogin(provider: "google" | "github", email: string) {
  return apiRequest<AuthResponse>("/auth/social-login/", {
    method: "POST",
    body: JSON.stringify({ provider, email }),
  });
}