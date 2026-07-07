import { CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  return <section className="container-page py-16"><div className="glass-panel max-w-3xl rounded-lg p-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Perfil</p><h1 className="mt-2 font-display text-4xl font-bold">Hola, {user.name}</h1><div className="mt-8 grid gap-4 sm:grid-cols-2"><p className="flex items-center gap-3 rounded-md bg-white/5 p-4"><UserRound className="text-gold" /> {user.role}</p><p className="flex items-center gap-3 rounded-md bg-white/5 p-4"><Mail className="text-gold" /> {user.email}</p><p className="flex items-center gap-3 rounded-md bg-white/5 p-4"><Phone className="text-gold" /> {user.phone || "Sin telefono"}</p><Link className="btn-primary" to="/reservar"><CalendarDays size={18} /> Reservar turno</Link></div></div></section>;
}
