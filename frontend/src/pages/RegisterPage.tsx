import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard } from "../components/auth/AuthCard";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await registerUser(form);
      const payload = {
        user: response.user,
        tokens: response.tokens ?? { access: response.access, refresh: response.refresh },
      };
      register(payload);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nao foi possivel concluir o cadastro.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Cadastro"
      subtitle="Crie sua conta para salvar templates e acompanhar seu historico de geracoes."
      submitLabel="Criar conta"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <label className="block text-sm font-semibold text-slate-700">
        Nome de usuario
        <input
          type="text"
          value={form.username}
          onChange={(event) => updateField("username", event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-lake focus:outline-none"
          placeholder="seu_usuario"
          required
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        E-mail
        <input
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-lake focus:outline-none"
          placeholder="voce@exemplo.com"
          required
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Senha
        <input
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-lake focus:outline-none"
          placeholder="********"
          required
        />
      </label>

      <label className="block text-sm font-semibold text-slate-700">
        Confirmar senha
        <input
          type="password"
          value={form.password_confirm}
          onChange={(event) => updateField("password_confirm", event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-lake focus:outline-none"
          placeholder="********"
          required
        />
      </label>

      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}

      <p className="text-center text-sm text-slate-600">
        Ja possui conta? <Link to="/login" className="font-semibold text-lake">Entrar</Link>
      </p>
    </AuthCard>
  );
}