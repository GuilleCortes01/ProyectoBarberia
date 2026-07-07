import { Clock, Sparkles } from "lucide-react";

export default function ServiceCard({ service }) {
  return (
    <article className="glass-panel rounded-lg p-5 transition hover:-translate-y-1 hover:border-gold/40">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-gold/15 text-gold"><Sparkles size={20} /></span>
        <span className="font-bold text-gold">${Number(service.price).toLocaleString("es-AR")}</span>
      </div>
      <h3 className="text-lg font-bold">{service.name}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{service.description}</p>
      <p className="mt-4 flex items-center gap-2 text-sm text-slate-300"><Clock size={16} className="text-gold" /> {service.durationMin} min</p>
    </article>
  );
}
