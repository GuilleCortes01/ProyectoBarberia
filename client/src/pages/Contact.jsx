import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export default function Contact() {
  return (
    <section className="container-page py-16">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Contacto</p>
        <h1 className="section-title">Urban Barber Studio</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Agenda tu proximo corte o escribinos para consultar disponibilidad.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="glass-panel rounded-lg p-8">
          <div className="space-y-5 text-slate-300">
            <p className="flex items-center gap-3"><Phone className="text-gold" /> +54 381 555-1234</p>
            <p className="flex items-center gap-3"><Mail className="text-gold" /> hola@urbanbarber.com</p>
            <p className="flex items-center gap-3"><Instagram className="text-gold" /> @urbanbarberstudio</p>
            <p className="flex items-center gap-3"><MapPin className="text-gold" /> Av. Principal 1240, San Miguel de Tucuman</p>
          </div>
          <div className="mt-8 grid gap-3">
            <a href="https://wa.me/5493815551234" target="_blank" rel="noreferrer" className="btn-primary w-full"><MessageCircle size={18} /> Escribir por WhatsApp</a>
            <a href="https://wa.me/5493815551234?text=Hola,%20quiero%20ver%20una%20demo%20del%20sistema%20para%20mi%20barberia" target="_blank" rel="noreferrer" className="btn-secondary w-full">Quiero un sistema asi</a>
          </div>
        </div>

        <div className="min-h-80 overflow-hidden rounded-lg border border-white/10 bg-smoke">
          <iframe title="Mapa demo" src="https://maps.google.com/maps?q=San%20Miguel%20de%20Tucuman&t=&z=13&ie=UTF8&iwloc=&output=embed" className="h-full min-h-80 w-full border-0 grayscale invert-[0.9]" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
