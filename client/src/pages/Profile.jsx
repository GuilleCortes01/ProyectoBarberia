import { CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <section className="container-page py-10 sm:py-16">
      <div className="glass-panel max-w-3xl rounded-lg p-5 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Perfil</p>
        <h1 className="mt-2 break-words font-display text-3xl font-bold sm:text-4xl">Hola, {user.name}</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <p className="flex items-center gap-3 rounded-md bg-white/5 p-4"><UserRound className="shrink-0 text-gold" /> {user.role}</p>
          <p className="flex min-w-0 items-center gap-3 rounded-md bg-white/5 p-4"><Mail className="shrink-0 text-gold" /> <span className="break-all">{user.email}</span></p>
          <p className="flex items-center gap-3 rounded-md bg-white/5 p-4"><Phone className="shrink-0 text-gold" /> {user.phone || "Sin telefono"}</p>
          <Link className="btn-primary w-full" to="/reservar"><CalendarDays size={18} /> Reservar turno</Link>
        </div>
      </div>
    </section>
  );
}
