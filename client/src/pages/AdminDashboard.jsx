import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import AdminNav from "../components/AdminNav";
import StatusBadge from "../components/StatusBadge";
import { whatsappUrl } from "../utils/whatsapp";

function today() { return new Date().toISOString().slice(0, 10); }

function adminMessage(item) {
  const date = new Date(item.date).toLocaleDateString("es-AR", { timeZone: "UTC" });
  return `Hola ${item.client.name}, te escribimos de Urban Barber Studio por tu turno de ${item.service.name} el ${date} a las ${item.time}.`;
}

function money(value) {
  return Number(value || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function AdminDashboard() {
  const [date, setDate] = useState(today());
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);

  async function load() {
    const [summaryRes, appointmentsRes, barbersRes] = await Promise.all([
      api.get(`/admin/summary?date=${date}`),
      api.get(`/admin/appointments?date=${date}`),
      api.get("/admin/barbers")
    ]);
    setSummary(summaryRes.data);
    setAppointments(appointmentsRes.data);
    setBarbers(barbersRes.data.filter((barber) => barber.active));
  }

  useEffect(() => { load(); }, [date]);

  async function updateStatus(id, status) {
    const appointment = appointments.find((item) => item.id === id);
    if (appointment?.status === "CANCELLED" && status === "FINISHED") return;
    await api.patch(`/admin/appointments/${id}/status`, { status });
    load();
  }

  async function updateBarber(id, barberId) {
    await api.patch(`/admin/appointments/${id}/barber`, { barberId });
    load();
  }

  return (
    <section className="container-page py-16">
      <AdminNav />
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Admin</p>
          <h1 className="section-title">Panel administrador</h1>
          <p className="mt-3 text-sm text-slate-400">Gestion diaria de turnos, estados y contacto con clientes.</p>
        </div>
        <input className="input max-w-xs" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {summary && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["Turnos", summary.appointments], ["Ocupados", summary.occupied], ["Finalizados", summary.cuts], ["Ganancia", money(summary.revenue)], ["Cancelados", summary.cancelled], ["Tasa cancelacion", `${summary.cancellationRate}%`], ["Cancelo cliente", summary.clientCancelled], ["Tasa cliente", `${summary.clientCancellationRate}%`]].map(([label, value]) => (
            <div key={label} className="glass-panel rounded-lg p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-extrabold text-gold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {summary?.barberStats?.length > 0 && (
        <div className="mb-8 glass-panel rounded-lg p-6">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold">Cierre por barbero</h2>
              <p className="mt-1 text-sm text-slate-400">Cuenta solo turnos finalizados. Cancelados no suman cortes ni ganancia.</p>
            </div>
            <p className="text-sm font-bold text-gold">Barberos libres ahora: {summary.availableBarbers}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {summary.barberStats.map((item) => (
              <div key={item.barberId} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="font-bold text-white">{item.barberName}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div><p className="text-slate-500">Cortes</p><p className="font-bold text-gold">{item.cuts}</p></div>
                  <div><p className="text-slate-500">Ganancia</p><p className="font-bold text-gold">{money(item.revenue)}</p></div>
                  <div><p className="text-slate-500">Ocupados</p><p className="font-bold text-gold">{item.occupied}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-panel overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-slate-400">
              <tr><th className="p-4">Hora</th><th>Cliente</th><th>Telefono</th><th>Servicio</th><th>Atendio</th><th>Modo</th><th>Estado</th><th>Cancelacion</th><th>Accion</th><th>Contacto</th></tr>
            </thead>
            <tbody>
              {appointments.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="p-4 font-bold text-gold">{item.time}</td>
                  <td>{item.client.name}</td>
                  <td>{item.client.phone || "-"}</td>
                  <td>{item.service.name}</td>
                  <td>
                    {["PENDING", "CONFIRMED"].includes(item.status) ? (
                      <select className="input py-2" value={item.barberId} onChange={(e) => updateBarber(item.id, e.target.value)}>
                        {barbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
                      </select>
                    ) : (
                      item.barber.name
                    )}
                  </td>
                  <td>{item.anyBarber ? "Cualquiera" : "Especifico"}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>{item.status === "CANCELLED" ? (item.cancelledBy === "CLIENT" ? "Cliente" : "Admin") : "-"}</td>
                  <td><select className="input py-2" value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)}><option value="PENDING">Pendiente</option><option value="CONFIRMED">Confirmada</option><option value="CANCELLED">Cancelada</option><option value="FINISHED" disabled={item.status === "CANCELLED"}>Finalizada</option></select></td>
                  <td><a className="btn-secondary px-3 py-2" href={whatsappUrl(item.client.phone, adminMessage(item))} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {appointments.length === 0 && <p className="p-8 text-slate-400">No hay reservas para esta fecha.</p>}
      </div>
    </section>
  );
}
