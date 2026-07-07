import { motion } from "framer-motion";
import { CalendarDays, Instagram, MapPin, Scissors, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { demoBootstrap } from "../data/demo";
import BarberCard from "../components/BarberCard";
import ServiceCard from "../components/ServiceCard";

const gallery = [
  "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80"
];

export default function Home() {
  const [data, setData] = useState({ business: null, barbers: [], services: [] });

  useEffect(() => {
    api.get("/public/bootstrap").then(({ data }) => setData(data)).catch(() => setData(demoBootstrap));
  }, []);

  return (
    <>
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1800&q=85" alt="Barberia premium" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/25" />
        <div className="container-page relative flex min-h-[calc(100vh-5rem)] items-center py-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-bold text-gold"><Star size={16} /> Reserva online demo profesional</div>
            <h1 className="font-display text-5xl font-extrabold leading-tight sm:text-7xl">Urban Barber Studio</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">Cortes precisos, fades impecables y una experiencia urbana premium para clientes que quieren verse bien sin perder tiempo.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/reservar" className="btn-primary"><CalendarDays size={18} /> Reservar turno</Link>
              <a href="#servicios" className="btn-secondary"><Scissors size={18} /> Ver servicios</a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="servicios" className="container-page py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Servicios</p><h2 className="section-title">Menu de cortes</h2></div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">Precios, duracion y servicios pensados para una gestion clara desde el panel administrador.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.services.map((service) => <ServiceCard key={service.id} service={service} />)}</div>
      </section>

      <section className="bg-charcoal/80 py-20" id="barberos">
        <div className="container-page">
          <div className="mb-10"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Equipo</p><h2 className="section-title">Barberos especialistas</h2></div>
          <div className="grid gap-6 md:grid-cols-3">{data.barbers.map((barber) => <BarberCard key={barber.id} barber={barber} />)}</div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="mb-10"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Galeria</p><h2 className="section-title">Trabajos realizados</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gallery.map((src) => <img key={src} src={src} alt="Trabajo de barberia" className="h-72 w-full rounded-lg object-cover" />)}</div>
      </section>

      <section className="container-page pb-20">
        <div className="glass-panel grid gap-8 rounded-lg p-8 md:grid-cols-3">
          <div className="md:col-span-2"><h2 className="section-title">Listo para tu proximo corte</h2><p className="mt-3 text-slate-400">Reserva online, elegi barbero o deja que el sistema te asigne uno disponible.</p></div>
          <div className="space-y-3 text-sm text-slate-300"><p className="flex items-center gap-2"><Instagram className="text-gold" size={18} /> @urbanbarberstudio</p><p className="flex items-center gap-2"><MapPin className="text-gold" size={18} /> Av. Principal 1240</p><Link className="btn-primary w-full" to="/reservar">Reservar ahora</Link></div>
        </div>
      </section>
    </>
  );
}
