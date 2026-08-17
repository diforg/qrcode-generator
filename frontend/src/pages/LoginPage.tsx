import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard } from "../components/auth/AuthCard";
import { useAuth } from "../context/AuthContext";
import { loginUser, requestPasswordReset, socialLogin } from "../services/authService";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("tester@example.com");
  const [password, setPassword] = useState("StrongPass123!");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<"google" | "github" | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const response = await loginUser({ email, password });
      const payload = {
        user: response.user,
        tokens: response.tokens ?? { access: response.access, refresh: response.refresh },
      };
      login(payload);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nao foi possivel entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Informe um e-mail para recuperar a senha.");
      return;
    }

    try {
      setIsResetting(true);
      setError(null);
      const response = await requestPasswordReset(trimmedEmail);
      setNotice(response.message);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Nao foi possivel recuperar a senha.");
    } finally {
      setIsResetting(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "github") {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Informe seu e-mail antes de continuar com o login social.");
      return;
    }

    try {
      setError(null);
      setIsSocialLoading(provider);
      const response = await socialLogin(provider, trimmedEmail);
      login({
        user: response.user,
        tokens: response.tokens ?? { access: response.access, refresh: response.refresh },
      });
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nao foi possivel entrar com o login social.");
    } finally {
      setIsSocialLoading(null);
    }
  }

  return (
    <AuthCard
      title="Login"
      subtitle="Entre com seu e-mail e senha para acessar seu dashboard de templates e historico."
      submitLabel="Entrar"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <label className="block text-sm font-semibold text-slate-700">
        E-mail
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-lake focus:outline-none"
          placeholder="voce@exemplo.com"
          required
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Senha
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-lake focus:outline-none"
          placeholder="********"
          required
        />
      </label>

      <button
        type="button"
        onClick={() => void handlePasswordReset()}
        disabled={isResetting}
        className="text-left text-sm font-semibold text-lake disabled:opacity-60"
      >
        {isResetting ? "Enviando..." : "Esqueci minha senha"}
      </button>

      <div className="grid gap-3 pt-2">
        <button
          type="button"
          onClick={() => void handleSocialLogin("google")}
          disabled={isSocialLoading !== null}
          className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 disabled:opacity-60"
        >
          {isSocialLoading === "google" ? "Conectando ao Google..." : "Continuar com Google"}
        </button>
        <button
          type="button"
          onClick={() => void handleSocialLogin("github")}
          disabled={isSocialLoading !== null}
          className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 disabled:opacity-60"
        >
          {isSocialLoading === "github" ? "Conectando ao GitHub..." : "Continuar com GitHub"}
        </button>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
      {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p> : null}

      <p className="text-center text-sm text-slate-600">
        Ainda nao tem conta? <Link to="/register" className="font-semibold text-lake">Cadastre-se</Link>
      </p>
    </AuthCard>
  );
}