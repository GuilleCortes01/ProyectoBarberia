import { CalendarDays, LogOut, Menu, Scissors, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const links = isAdmin
    ? [
        { to: "/", label: "Inicio" },
        { to: "/contacto", label: "Contacto" },
        { to: "/admin", label: "Panel admin" }
      ]
    : [
        { to: "/", label: "Inicio" },
        { to: "/reservar", label: "Reservar" },
        { to: "/contacto", label: "Contacto" }
      ];

  const navClass = ({ isActive }) => `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-white/10 text-gold" : "text-slate-300 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-gold text-ink sm:h-11 sm:w-11"><Scissors size={23} /></span>
          <span>
            <span className="block truncate font-display text-lg font-bold leading-none sm:text-xl">Urban Barber</span>
            <span className="text-[0.65rem] uppercase tracking-[0.18em] text-gold sm:text-xs sm:tracking-[0.22em]">Studio</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => <NavLink key={link.to} to={link.to} className={navClass}>{link.label}</NavLink>)}
          {user && !isAdmin && <NavLink to="/mis-reservas" className={navClass}>Mis reservas</NavLink>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to={isAdmin ? "/admin" : "/perfil"} className="btn-secondary max-w-44 py-2"><UserRound size={16} /> <span className="truncate">{user.name}</span></Link>
              <button onClick={logout} className="btn-secondary py-2" aria-label="Cerrar sesion"><LogOut size={16} /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2">Ingresar</Link>
              <Link to="/registro" className="btn-primary py-2"><CalendarDays size={16} /> Crear cuenta</Link>
            </>
          )}
        </div>

        <button className="btn-secondary px-3 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-charcoal md:hidden">
          <div className="container-page grid gap-2 py-4">
            {links.map((link) => <NavLink key={link.to} onClick={() => setOpen(false)} to={link.to} className={navClass}>{link.label}</NavLink>)}
            {user && !isAdmin && <NavLink onClick={() => setOpen(false)} to="/mis-reservas" className={navClass}>Mis reservas</NavLink>}
            {user ? (
              <button onClick={() => { setOpen(false); logout(); }} className="btn-secondary mt-2 w-full">Cerrar sesion</button>
            ) : (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Link onClick={() => setOpen(false)} to="/login" className="btn-secondary w-full">Ingresar</Link>
                <Link onClick={() => setOpen(false)} to="/registro" className="btn-primary w-full">Crear cuenta</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
