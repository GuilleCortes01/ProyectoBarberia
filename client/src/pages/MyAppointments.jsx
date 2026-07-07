import { useEffect, useState } from "react";
import { api } from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  async function load() {
    const { data } = await api.get("/appointments/mine");
    setAppointments(data);
  }

  useEffect(() => { load(); }, []);

  async function cancel(id) {
    await api.patch(`/appointments/${id}/cancel`);
    load();
  }

  return <section className="container-page py-16"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Cliente</p><h1 className="section-title">Mis reservas</h1></div><div className="grid gap-4">{appointments.map((item) => <article key={item.id} className="glass-panel grid gap-4 rounded-lg p-5 md:grid-cols-[1fr_auto] md:items-center"><div><div className="mb-3 flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold">{item.service.name}</h2><StatusBadge status={item.status} /></div><p className="text-sm text-slate-400">{new Date(item.date).toLocaleDateString("es-AR", { timeZone: "UTC" })} a las {item.time} con {item.barber.name}</p><p className="mt-1 text-sm text-slate-500">Modalidad: {item.anyBarber ? "cualquier barbero disponible" : "barbero especifico"}</p></div>{!["CANCELLED", "FINISHED"].includes(item.status) && <button className="btn-secondary" onClick={() => cancel(item.id)}>Cancelar</button>}</article>)}{appointments.length === 0 && <p className="rounded-lg border border-white/10 p-8 text-slate-400">Todavia no tenes reservas.</p>}</div></section>;
}
