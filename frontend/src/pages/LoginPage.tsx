import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard } from "../components/auth/AuthCard";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("tester@example.com");
  const [password, setPassword] = useState("StrongPass123!");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
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

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

      <p className="text-center text-sm text-slate-600">
        Ainda nao tem conta? <Link to="/register" className="font-semibold text-lake">Cadastre-se</Link>
      </p>
    </AuthCard>
  );
}