import { Link } from "react-router-dom";


const features = [
  "Preview em tempo real conectado ao backend Django.",
  "Paleta customizavel, estilos de modulos e exportacao em PNG ou SVG.",
  "Base pronta para evoluir templates salvos, autenticacao e historico.",
];


export function LandingPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-20 px-6 py-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex rounded-full border border-ember/20 bg-ember/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-ember">
            Micro SaaS em construcao
          </span>
          <div className="space-y-5">
            <h1 className="max-w-2xl font-display text-5xl font-extrabold leading-tight text-ink md:text-6xl">
              Gere QR Codes com identidade visual, logo central e exportacao pronta para producao.
            </h1>
            <p className="max-w-xl text-lg text-slate-600">
              Esta primeira versao ja liga o front ao core de geracao. O proximo passo natural e adicionar autenticacao e CRUD de templates.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to="/generator" className="rounded-full bg-ink px-7 py-4 text-center text-sm font-bold text-white transition hover:bg-slate-800">
              Criar meu QR Code
            </Link>
            <a href="#features" className="rounded-full border border-slate-300 px-7 py-4 text-center text-sm font-bold text-ink transition hover:border-ink">
              Ver stack inicial
            </a>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-soft backdrop-blur">
          <div className="grid gap-4">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-ink to-lake p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Entrega 01</p>
              <p className="mt-3 font-display text-3xl font-bold">API de geracao + UI inicial</p>
            </div>
            <div className="grid gap-3 rounded-[1.5rem] bg-sand p-6">
              {features.map((feature) => (
                <p key={feature} className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-slate-700">
                  {feature}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="grid gap-6 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-ink">Backend</h2>
          <p className="mt-3 text-slate-600">Django 5 com DRF e servicos isolados para renderizacao, overlay e exportacao em memoria.</p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-ink">Frontend</h2>
          <p className="mt-3 text-slate-600">React + TypeScript com fluxo debounce para preview automatico e download direto do blob.</p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-ink">Infra</h2>
          <p className="mt-3 text-slate-600">Docker Compose, NGINX e variaveis de ambiente alinhadas ao plano para evoluir sem retrabalho estrutural.</p>
        </article>
      </section>
    </main>
  );
}