import { Link, NavLink } from "react-router-dom";


const navItems = [
  { to: "/generator", label: "Gerador" },
  { to: "/dashboard", label: "Templates" },
  { to: "/history", label: "Historico" },
];


export function Navbar() {
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
        </nav>
      </div>
    </header>
  );
}