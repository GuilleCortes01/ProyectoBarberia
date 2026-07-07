import { Clock, Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../api/client";
import AdminNav from "../components/AdminNav";

const empty = { name: "", specialty: "", description: "", instagram: "", reference: "", photoUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80", active: true };
const days = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mie" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" }
];

function availabilityText(availability = []) {
  if (!availability.length) return "Sin horarios cargados";
  const active = availability.filter((item) => item.active);
  const labels = active.map((item) => days.find((day) => day.value === item.dayOfWeek)?.label).filter(Boolean).join(", ");
  const first = active[0];
  return first ? `${labels} ${first.startTime} - ${first.endTime}` : "Sin horarios activos";
}

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [scheduleBarber, setScheduleBarber] = useState(null);
  const [schedule, setSchedule] = useState({ days: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00", slotMinutes: 30 });
  const { register, handleSubmit, reset } = useForm({ defaultValues: empty });

  const selectedScheduleBarber = useMemo(() => barbers.find((barber) => barber.id === scheduleBarber), [barbers, scheduleBarber]);

  async function load() {
    const { data } = await api.get("/admin/barbers");
    setBarbers(data);
  }

  useEffect(() => { load(); }, []);

  function edit(barber) {
    setEditing(barber.id);
    reset(barber);
  }

  function openSchedule(barber) {
    const active = barber.availability?.filter((item) => item.active) || [];
    const first = active[0];
    setScheduleBarber(barber.id);
    setSchedule({
      days: active.length ? active.map((item) => item.dayOfWeek) : [1, 2, 3, 4, 5, 6],
      startTime: first?.startTime || "09:00",
      endTime: first?.endTime || "18:00",
      slotMinutes: first?.slotMinutes || 30
    });
  }

  async function onSubmit(values) {
    if (editing) await api.put(`/admin/barbers/${editing}`, values);
    else await api.post("/admin/barbers", values);
    setEditing(null);
    reset(empty);
    load();
  }

  async function saveSchedule() {
    if (!scheduleBarber) return;
    await api.put(`/admin/barbers/${scheduleBarber}/availability`, {
      availability: schedule.days.map((dayOfWeek) => ({
        dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotMinutes: Number(schedule.slotMinutes),
        active: true
      }))
    });
    await load();
  }

  async function remove(id) {
    await api.delete(`/admin/barbers/${id}`);
    load();
  }

  function toggleDay(day) {
    setSchedule((current) => ({
      ...current,
      days: current.days.includes(day) ? current.days.filter((item) => item !== day) : [...current.days, day].sort()
    }));
  }

  return (
    <section className="container-page py-16">
      <AdminNav />
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Gestion</p>
        <h1 className="section-title">Barberos</h1>
        <p className="mt-3 text-sm text-slate-400">Crea barberos y configura sus dias y horarios disponibles.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-lg p-6">
            <h2 className="mb-5 text-xl font-bold">{editing ? "Editar barbero" : "Nuevo barbero"}</h2>
            <div className="grid gap-4">
              <input className="input" placeholder="Nombre" {...register("name", { required: true })} />
              <input className="input" placeholder="Especialidad" {...register("specialty", { required: true })} />
              <textarea className="input min-h-24" placeholder="Descripcion" {...register("description", { required: true })} />
              <input className="input" placeholder="Instagram" {...register("instagram", { required: true })} />
              <input className="input" placeholder="Referencia" {...register("reference", { required: true })} />
              <input className="input" placeholder="URL foto" {...register("photoUrl", { required: true })} />
              <button className="btn-primary" type="submit"><Plus size={18} /> {editing ? "Guardar cambios" : "Crear barbero"}</button>
              {editing && <button className="btn-secondary" type="button" onClick={() => { setEditing(null); reset(empty); }}>Cancelar edicion</button>}
            </div>
          </form>

          <div className="glass-panel rounded-lg p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold"><Clock className="text-gold" /> Horarios</h2>
            <p className="mb-4 text-sm text-slate-400">{selectedScheduleBarber ? `Editando a ${selectedScheduleBarber.name}` : "Selecciona un barbero para editar sus horarios."}</p>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 gap-2">
                {days.map((day) => (
                  <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={`rounded-md border px-3 py-2 text-sm font-bold ${schedule.days.includes(day.value) ? "border-gold bg-gold text-ink" : "border-white/10 bg-white/5 text-slate-300"}`}>{day.label}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input" type="time" value={schedule.startTime} onChange={(event) => setSchedule((current) => ({ ...current, startTime: event.target.value }))} />
                <input className="input" type="time" value={schedule.endTime} onChange={(event) => setSchedule((current) => ({ ...current, endTime: event.target.value }))} />
              </div>
              <input className="input" type="number" min="15" step="15" value={schedule.slotMinutes} onChange={(event) => setSchedule((current) => ({ ...current, slotMinutes: event.target.value }))} />
              <button className="btn-primary" type="button" disabled={!scheduleBarber || schedule.days.length === 0} onClick={saveSchedule}>Guardar horarios</button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {barbers.map((barber) => (
            <article key={barber.id} className="glass-panel grid gap-4 rounded-lg p-4 sm:grid-cols-[120px_1fr_auto]">
              <img src={barber.photoUrl} className="h-28 w-full rounded-md object-cover sm:w-28" alt={barber.name} />
              <div>
                <h3 className="text-lg font-bold">{barber.name}</h3>
                <p className="text-sm text-gold">{barber.specialty}</p>
                <p className="mt-2 text-sm text-slate-400">{barber.reference}</p>
                <p className="mt-1 text-xs text-slate-500">{barber.active ? "Activo" : "Inactivo"}</p>
                <p className="mt-2 text-sm text-slate-300">{availabilityText(barber.availability)}</p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <button className="btn-secondary px-3" onClick={() => edit(barber)} aria-label="Editar"><Edit3 size={16} /></button>
                <button className="btn-secondary px-3" onClick={() => openSchedule(barber)} aria-label="Horarios"><Clock size={16} /></button>
                <button className="btn-secondary px-3" onClick={() => remove(barber.id)} aria-label="Eliminar"><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
