import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  auth_provider: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  login: (payload: { user: AuthUser; tokens: AuthTokens }) => void;
  logout: () => void;
  register: (payload: { user: AuthUser; tokens: AuthTokens }) => void;
}

const STORAGE_KEY = "qrcode-generator-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredAuth(): { user: AuthUser | null; tokens: AuthTokens | null } {
  if (typeof window === "undefined") {
    return { user: null, tokens: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { user: null, tokens: null };
    }

    return JSON.parse(raw) as { user: AuthUser | null; tokens: AuthTokens | null };
  } catch {
    return { user: null, tokens: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState(readStoredAuth);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (auth.user && auth.tokens?.access) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth.user,
      tokens: auth.tokens,
      isAuthenticated: Boolean(auth.user && auth.tokens?.access),
      login: (payload) => {
        const nextAuth = { user: payload.user, tokens: payload.tokens };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
        }
        setAuth(nextAuth);
      },
      logout: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY);
        }
        setAuth({ user: null, tokens: null });
      },
      register: (payload) => {
        const nextAuth = { user: payload.user, tokens: payload.tokens };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
        }
        setAuth(nextAuth);
      },
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
