import { useEffect, useState } from "react";
import { api } from "../api/client";
import AdminNav from "../components/AdminNav";
import StatusBadge from "../components/StatusBadge";

function today() { return new Date().toISOString().slice(0, 10); }

export default function AdminDashboard() {
  const [date, setDate] = useState(today());
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);

  async function load() {
    const [summaryRes, appointmentsRes] = await Promise.all([
      api.get(`/admin/summary?date=${date}`),
      api.get(`/admin/appointments?date=${date}`)
    ]);
    setSummary(summaryRes.data);
    setAppointments(appointmentsRes.data);
  }

  useEffect(() => { load(); }, [date]);

  async function updateStatus(id, status) {
    await api.patch(`/admin/appointments/${id}/status`, { status });
    load();
  }

  return <section className="container-page py-16"><AdminNav /><div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Admin</p><h1 className="section-title">Panel administrador</h1></div><input className="input max-w-xs" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>{summary && <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Turnos", summary.appointments], ["Ocupados", summary.occupied], ["Finalizados", summary.cuts], ["Barberos libres", summary.availableBarbers]].map(([label, value]) => <div key={label} className="glass-panel rounded-lg p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-extrabold text-gold">{value}</p></div>)}</div>}<div className="glass-panel overflow-hidden rounded-lg"><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-slate-400"><tr><th className="p-4">Hora</th><th>Cliente</th><th>Telefono</th><th>Servicio</th><th>Barbero</th><th>Modo</th><th>Estado</th><th>Accion</th></tr></thead><tbody>{appointments.map((item) => <tr key={item.id} className="border-t border-white/10"><td className="p-4 font-bold text-gold">{item.time}</td><td>{item.client.name}</td><td>{item.client.phone || "-"}</td><td>{item.service.name}</td><td>{item.barber.name}</td><td>{item.anyBarber ? "Cualquiera" : "Especifico"}</td><td><StatusBadge status={item.status} /></td><td><select className="input py-2" value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)}><option value="PENDING">Pendiente</option><option value="CONFIRMED">Confirmada</option><option value="CANCELLED">Cancelada</option><option value="FINISHED">Finalizada</option></select></td></tr>)}</tbody></table></div>{appointments.length === 0 && <p className="p-8 text-slate-400">No hay reservas para esta fecha.</p>}</div></section>;
}
