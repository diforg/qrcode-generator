import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


const navItems = [
  { to: "/generator", label: "Gerador" },
  { to: "/dashboard", label: "Templates" },
  { to: "/history", label: "Historico" },
];


export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-ink">
          QRCode Generator
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold text-slate-600">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "text-ember" : "transition hover:text-ink"
              }
            >
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <>
              <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-slate-500 md:inline-block">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="rounded-full border border-slate-300 px-4 py-2 transition hover:border-ink hover:text-ink"
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-full bg-ink px-4 py-2 text-white transition hover:bg-slate-800">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}