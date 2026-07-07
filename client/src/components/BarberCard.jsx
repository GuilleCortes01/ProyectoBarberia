import { CalendarDays, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export default function BarberCard({ barber }) {
  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-premium transition hover:-translate-y-1 hover:border-gold/40">
      <img src={barber.photoUrl} alt={barber.name} className="h-72 w-full object-cover" />
      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-display text-2xl font-bold">{barber.name}</h3>
          <p className="text-sm font-semibold text-gold">{barber.specialty}</p>
        </div>
        <p className="text-sm leading-6 text-slate-400">{barber.description}</p>
        <div className="grid gap-2 text-sm text-slate-300">
          <span>{barber.reference}</span>
          <span className="flex items-center gap-2"><Instagram size={16} className="text-gold" /> {barber.instagram}</span>
          <span>Horarios: lun. a sab. 09:00 - 18:00</span>
        </div>
        <Link to={`/reservar?barberId=${barber.id}`} className="btn-primary w-full"><CalendarDays size={16} /> Reservar con {barber.name.split(" ")[0]}</Link>
      </div>
    </article>
  );
}
