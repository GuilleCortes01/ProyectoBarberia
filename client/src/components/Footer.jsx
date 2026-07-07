import { Instagram, MapPin, Phone, Scissors } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-3"><Scissors className="text-gold" /> <span className="font-display text-2xl font-bold">Urban Barber Studio</span></div>
          <p className="max-w-md text-sm leading-6 text-slate-400">Sistema demo profesional para barberias: reservas, gestion de servicios, barberos y panel privado.</p>
        </div>
        <div className="space-y-3 text-sm text-slate-300">
          <p className="flex items-center gap-2"><Phone size={16} className="text-gold" /> +54 381 555-1234</p>
          <p className="flex items-center gap-2"><Instagram size={16} className="text-gold" /> @urbanbarberstudio</p>
          <p className="flex items-center gap-2"><MapPin size={16} className="text-gold" /> Av. Principal 1240</p>
        </div>
        <div className="text-sm text-slate-500 md:text-right">Demo lista para personalizar y vender a una barberia real.</div>
      </div>
    </footer>
  );
}
