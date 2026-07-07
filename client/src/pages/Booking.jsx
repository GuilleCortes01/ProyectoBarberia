import { CalendarDays, CheckCircle2, Scissors } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import { buildDemoAvailability, demoBootstrap } from "../data/demo";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const [bootstrap, setBootstrap] = useState({ services: [], barbers: [] });
  const [availability, setAvailability] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { date: today(), anyBarber: "true", barberId: searchParams.get("barberId") || "" }
  });

  const values = watch();
  const anyBarber = values.anyBarber === "true";

  useEffect(() => {
    api.get("/public/bootstrap").catch(() => ({ data: demoBootstrap })).then(({ data }) => {
      setBootstrap(data);
      if (data.services[0]) setValue("serviceId", data.services[0].id);
      if (searchParams.get("barberId")) setValue("anyBarber", "false");
    });
  }, [searchParams, setValue]);

  useEffect(() => {
    if (!values.date || !values.serviceId) return;
    const params = new URLSearchParams({ date: values.date, serviceId: values.serviceId });
    if (!anyBarber && values.barberId) params.set("barberId", values.barberId);
    if (!anyBarber && !values.barberId) return;
    api.get(`/appointments/availability?${params.toString()}`).catch(() => ({ data: buildDemoAvailability(values.barberId) })).then(({ data }) => {
      setAvailability(data);
      setSelectedTime("");
    });
  }, [values.date, values.serviceId, values.barberId, anyBarber]);

  const slots = useMemo(() => {
    if (!availability) return [];
    return anyBarber ? availability.times : availability.slots.filter((slot) => slot.barberId === values.barberId);
  }, [availability, anyBarber, values.barberId]);

  async function onSubmit(form) {
    setError("");
    setMessage("");
    try {
      if (!selectedTime) throw new Error("Selecciona un horario disponible.");
      await api.post("/appointments", {
        serviceId: form.serviceId,
        date: form.date,
        time: selectedTime,
        barberId: anyBarber ? undefined : form.barberId,
        anyBarber
      });
      setMessage("Reserva creada correctamente. Podes verla en Mis reservas.");
    } catch (err) {
      setError(err.message || getErrorMessage(err));
    }
  }

  return <section className="container-page py-16"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Reservas</p><h1 className="section-title">Reservar turno</h1><p className="mt-3 max-w-2xl text-slate-400">El sistema muestra solo horarios disponibles y evita reservas duplicadas para el mismo barbero.</p></div><div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"><form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-lg p-6"><div className="grid gap-5"><div><label className="label">Servicio</label><select className="input" {...register("serviceId", { required: true })}>{bootstrap.services.map((service) => <option key={service.id} value={service.id}>{service.name} - ${Number(service.price).toLocaleString("es-AR")}</option>)}</select></div><div><label className="label">Preferencia de barbero</label><div className="grid grid-cols-2 gap-2"><label className={`rounded-md border p-3 text-sm font-bold ${anyBarber ? "border-gold bg-gold text-ink" : "border-white/10 bg-white/5"}`}><input className="sr-only" type="radio" value="true" {...register("anyBarber")} /> Cualquiera</label><label className={`rounded-md border p-3 text-sm font-bold ${!anyBarber ? "border-gold bg-gold text-ink" : "border-white/10 bg-white/5"}`}><input className="sr-only" type="radio" value="false" {...register("anyBarber")} /> Especifico</label></div></div>{!anyBarber && <div><label className="label">Barbero</label><select className="input" {...register("barberId", { required: !anyBarber })}><option value="">Seleccionar</option>{bootstrap.barbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}</select></div>}<div><label className="label">Fecha</label><input className="input" type="date" min={today()} {...register("date", { required: true })} /></div><button className="btn-primary" type="submit"><CalendarDays size={18} /> Confirmar reserva</button>{message && <p className="rounded-md border border-teal-400/30 bg-teal-400/10 p-3 text-sm text-teal-100">{message}</p>}{error && <p className="rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}</div></form><div className="glass-panel rounded-lg p-6"><div className="mb-5 flex items-center gap-3"><Scissors className="text-gold" /><h2 className="text-2xl font-bold">Horarios disponibles</h2></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{slots.map((slot) => { const time = slot.time; const disabled = slot.available === false; return <button key={`${time}-${slot.barberId || "any"}`} disabled={disabled} onClick={() => setSelectedTime(time)} className={`rounded-md border p-3 text-sm font-bold transition ${selectedTime === time ? "border-gold bg-gold text-ink" : disabled ? "cursor-not-allowed border-white/5 bg-white/[0.03] text-slate-600" : "border-white/10 bg-white/5 text-white hover:border-gold/70"}`}>{time}{slot.barbers && <span className="mt-1 block text-xs opacity-70">{slot.barbers.length} barberos</span>}</button>; })}</div>{slots.length === 0 && <p className="rounded-md border border-white/10 p-6 text-slate-400">No hay horarios disponibles para esa seleccion.</p>}<div className="mt-6 flex items-start gap-3 rounded-md bg-white/5 p-4 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 text-teal" size={18} /> Si elegis cualquier barbero, el backend asigna automaticamente uno libre en ese horario.</div></div></div></section>;
}
