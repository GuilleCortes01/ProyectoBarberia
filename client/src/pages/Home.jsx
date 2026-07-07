import { motion } from "framer-motion";
import { BarChart3, CalendarDays, Clock, Instagram, MapPin, MessageCircle, Scissors, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import BarberCard from "../components/BarberCard";
import ServiceCard from "../components/ServiceCard";
import { useAuth } from "../context/AuthContext";
import { demoBootstrap } from "../data/demo";

const gallery = [
  "https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80"
];

const highlights = [
  { value: "4.9", label: "valoracion promedio" },
  { value: "+120", label: "cortes por mes" },
  { value: "30 min", label: "turnos agiles" }
];

const ownerFeatures = [
  {
    icon: CalendarDays,
    title: "Reservas online 24/7",
    text: "Tus clientes reservan sin escribirte cada horario por WhatsApp."
  },
  {
    icon: Clock,
    title: "Horarios sin doble reserva",
    text: "El sistema bloquea turnos ocupados y permite asignar el barbero real."
  },
  {
    icon: BarChart3,
    title: "Resumen del dia",
    text: "Cortes, cancelaciones, ganancia total y rendimiento por barbero."
  },
  {
    icon: ShieldCheck,
    title: "Control para el dueño",
    text: "Administra servicios, barberos, estados y disponibilidad desde un panel privado."
  }
];

export default function Home() {
  const [data, setData] = useState({ business: null, barbers: [], services: [] });
  const { isAdmin } = useAuth();

  useEffect(() => {
    api.get("/public/bootstrap").then(({ data }) => setData(data)).catch(() => setData(demoBootstrap));
  }, []);

  return (
    <>
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden sm:min-h-[calc(100vh-5rem)]">
        <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1800&q=85" alt="Barberia premium" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/95 via-ink/88 to-ink/55 sm:bg-gradient-to-r sm:from-ink sm:via-ink/90 sm:to-ink/35" />
        <div className="container-page relative flex min-h-[calc(100svh-4rem)] items-center py-12 sm:min-h-[calc(100vh-5rem)] sm:py-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-bold text-gold sm:mb-6 sm:px-4 sm:text-sm"><Star size={16} /> Barberia premium con turnos online</div>
            <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">Urban Barber Studio</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:mt-6 sm:text-lg sm:leading-8">Cortes precisos, fades impecables y una experiencia moderna para clientes que quieren reservar rapido y salir con estilo.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isAdmin ? (
                <Link to="/admin" className="btn-primary w-full sm:w-auto"><CalendarDays size={18} /> Ir al panel</Link>
              ) : (
                <Link to="/reservar" className="btn-primary w-full sm:w-auto"><CalendarDays size={18} /> Reservar turno</Link>
              )}
              <a href="https://wa.me/5493815551234" target="_blank" rel="noreferrer" className="btn-secondary w-full sm:w-auto"><MessageCircle size={18} /> WhatsApp</a>
              <a href="#servicios" className="btn-secondary w-full sm:w-auto"><Scissors size={18} /> Ver servicios</a>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <p className="text-2xl font-extrabold text-gold">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="servicios" className="container-page py-14 sm:py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Servicios</p><h2 className="section-title">Menu de cortes</h2></div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">Servicios claros, precios visibles y tiempos pensados para que el cliente elija sin vueltas.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.services.map((service) => <ServiceCard key={service.id} service={service} />)}</div>
      </section>

      <section className="bg-charcoal/80 py-14 sm:py-20" id="barberos">
        <div className="container-page">
          <div className="mb-10"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Equipo</p><h2 className="section-title">Barberos especialistas</h2></div>
          <div className="grid gap-6 md:grid-cols-3">{data.barbers.map((barber) => <BarberCard key={barber.id} barber={barber} />)}</div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Para barberias</p>
            <h2 className="section-title">Una demo pensada para vender organizacion</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">La identidad visual se personaliza con logo, colores, servicios y fotos de cada local cuando aparece el cliente real.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {ownerFeatures.map(({ icon: Icon, title, text }) => (
            <article key={title} className="glass-panel rounded-lg p-5">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-md bg-gold/15 text-gold"><Icon size={21} /></span>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="mb-10"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Galeria</p><h2 className="section-title">Trabajos realizados</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gallery.map((src) => <img key={src} src={src} alt="Trabajo de barberia" className="h-56 w-full rounded-lg object-cover sm:h-72" />)}</div>
      </section>

      <section className="container-page pb-14 sm:pb-20">
        <div className="glass-panel grid gap-8 rounded-lg p-5 sm:p-8 md:grid-cols-3">
          <div className="md:col-span-2"><h2 className="section-title">Listo para mostrar a una barberia real</h2><p className="mt-3 text-slate-400">Podes enseñar el recorrido del cliente, el panel del dueño y explicar que se personaliza con la marca de cada local.</p></div>
          <div className="space-y-3 text-sm text-slate-300">
            <p className="flex items-center gap-2"><Instagram className="text-gold" size={18} /> @urbanbarberstudio</p>
            <p className="flex items-center gap-2"><MapPin className="text-gold" size={18} /> Av. Principal 1240</p>
            {isAdmin ? <Link className="btn-primary w-full" to="/admin">Ver panel</Link> : <Link className="btn-primary w-full" to="/reservar">Reservar ahora</Link>}
            <a className="btn-secondary w-full" href="https://wa.me/5493815551234?text=Hola,%20quiero%20una%20demo%20de%20sistema%20de%20turnos%20para%20barberia" target="_blank" rel="noreferrer">Quiero una demo asi</a>
          </div>
        </div>
      </section>
    </>
  );
}
