import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import { appointmentMessage, whatsappUrl } from "../utils/whatsapp";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [business, setBusiness] = useState(null);

  async function load() {
    const [appointmentsRes, bootstrapRes] = await Promise.all([
      api.get("/appointments/mine"),
      api.get("/public/bootstrap").catch(() => ({ data: { business: null } }))
    ]);
    setAppointments(appointmentsRes.data);
    setBusiness(bootstrapRes.data.business);
  }

  useEffect(() => { load(); }, []);

  async function cancel(id) {
    await api.patch(`/appointments/${id}/cancel`);
    load();
  }

  async function remove(id) {
    await api.delete(`/appointments/${id}`);
    load();
  }

  return (
    <section className="container-page py-10 sm:py-16">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Cliente</p>
        <h1 className="section-title">Mis reservas</h1>
      </div>
      <div className="grid gap-4">
        {appointments.map((item) => (
          <article key={item.id} className="glass-panel grid gap-4 rounded-lg p-4 sm:p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold">{item.service.name}</h2><StatusBadge status={item.status} /></div>
              <p className="text-sm text-slate-400">{new Date(item.date).toLocaleDateString("es-AR", { timeZone: "UTC" })} a las {item.time} con {item.barber.name}</p>
              <p className="mt-1 text-sm text-slate-500">Modalidad: {item.anyBarber ? "cualquier barbero disponible" : "barbero especifico"}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
              <a className="btn-secondary w-full py-2" href={whatsappUrl(business?.phone, appointmentMessage(item, "Hola, queria consultar por mi turno"))} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
              {!["CANCELLED", "FINISHED"].includes(item.status) && <button className="btn-secondary w-full py-2" onClick={() => cancel(item.id)}>Cancelar</button>}
              {item.status === "CANCELLED" && <button className="btn-secondary w-full py-2" onClick={() => remove(item.id)}>Eliminar</button>}
            </div>
          </article>
        ))}
        {appointments.length === 0 && <p className="rounded-lg border border-white/10 p-8 text-slate-400">Todavia no tenes reservas.</p>}
      </div>
    </section>
  );
}
