import { CalendarDays, CheckCircle2, MessageCircle, Scissors } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import { buildDemoAvailability, demoBootstrap } from "../data/demo";
import { appointmentMessage, whatsappUrl } from "../utils/whatsapp";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const [bootstrap, setBootstrap] = useState({ business: null, services: [], barbers: [] });
  const [availability, setAvailability] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [confirmed, setConfirmed] = useState(null);
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

    api.get(`/appointments/availability?${params.toString()}`)
      .catch(() => ({ data: buildDemoAvailability(values.barberId) }))
      .then(({ data }) => {
        setAvailability(data);
        setSelectedTime("");
        setConfirmed(null);
      });
  }, [values.date, values.serviceId, values.barberId, anyBarber]);

  const slots = useMemo(() => {
    if (!availability) return [];
    return anyBarber ? availability.times : availability.slots.filter((slot) => slot.barberId === values.barberId);
  }, [availability, anyBarber, values.barberId]);

  const selectedService = bootstrap.services.find((service) => service.id === values.serviceId);
  const selectedBarber = bootstrap.barbers.find((barber) => barber.id === values.barberId);

  async function onSubmit(form) {
    setError("");
    setConfirmed(null);
    try {
      if (!selectedTime) throw new Error("Selecciona un horario disponible.");
      const { data } = await api.post("/appointments", {
        serviceId: form.serviceId,
        date: form.date,
        time: selectedTime,
        barberId: anyBarber ? undefined : form.barberId,
        anyBarber
      });
      setConfirmed(data);
    } catch (err) {
      setError(err.message || getErrorMessage(err));
    }
  }

  return (
    <section className="container-page py-16">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Reservas</p>
        <h1 className="section-title">Reservar turno</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Elegis servicio, barbero, fecha y horario. El sistema bloquea turnos ocupados automaticamente.</p>
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-4">
        {["Servicio", "Barbero", "Fecha", "Confirmacion"].map((step, index) => (
          <div key={step} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Paso {index + 1}</p>
            <p className="mt-1 font-semibold text-white">{step}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-lg p-6">
          <div className="grid gap-5">
            <div>
              <label className="label">Servicio</label>
              <select className="input" {...register("serviceId", { required: true })}>
                {bootstrap.services.map((service) => <option key={service.id} value={service.id}>{service.name} - ${Number(service.price).toLocaleString("es-AR")}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Preferencia de barbero</label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`rounded-md border p-3 text-sm font-bold ${anyBarber ? "border-gold bg-gold text-ink" : "border-white/10 bg-white/5"}`}>
                  <input className="sr-only" type="radio" value="true" {...register("anyBarber")} /> Cualquiera
                </label>
                <label className={`rounded-md border p-3 text-sm font-bold ${!anyBarber ? "border-gold bg-gold text-ink" : "border-white/10 bg-white/5"}`}>
                  <input className="sr-only" type="radio" value="false" {...register("anyBarber")} /> Especifico
                </label>
              </div>
            </div>

            {!anyBarber && (
              <div>
                <label className="label">Barbero</label>
                <select className="input" {...register("barberId", { required: !anyBarber })}>
                  <option value="">Seleccionar</option>
                  {bootstrap.barbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="label">Fecha</label>
              <input className="input" type="date" min={today()} {...register("date", { required: true })} />
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
              <p className="font-bold text-white">Resumen</p>
              <p className="mt-2">Servicio: {selectedService?.name || "-"}</p>
              <p>Barbero: {anyBarber ? "cualquier barbero disponible" : selectedBarber?.name || "-"}</p>
              <p>Fecha y hora: {values.date || "-"} {selectedTime ? `a las ${selectedTime}` : ""}</p>
            </div>

            <button className="btn-primary" type="submit"><CalendarDays size={18} /> Confirmar reserva</button>
            {error && <p className="rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
          </div>
        </form>

        <div className="glass-panel rounded-lg p-6">
          <div className="mb-5 flex items-center gap-3"><Scissors className="text-gold" /><h2 className="text-2xl font-bold">Horarios disponibles</h2></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {slots.map((slot) => {
              const time = slot.time;
              const disabled = slot.available === false;
              return <button key={`${time}-${slot.barberId || "any"}`} type="button" disabled={disabled} onClick={() => setSelectedTime(time)} className={`rounded-md border p-3 text-sm font-bold transition ${selectedTime === time ? "border-gold bg-gold text-ink" : disabled ? "cursor-not-allowed border-white/5 bg-white/[0.03] text-slate-600" : "border-white/10 bg-white/5 text-white hover:border-gold/70"}`}>{time}{slot.barbers && <span className="mt-1 block text-xs opacity-70">{slot.barbers.length} barberos</span>}</button>;
            })}
          </div>
          {slots.length === 0 && <p className="rounded-md border border-white/10 p-6 text-slate-400">No hay horarios disponibles para esa seleccion.</p>}
          <div className="mt-6 flex items-start gap-3 rounded-md bg-white/5 p-4 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 text-teal" size={18} /> Si elegis cualquier barbero, se asigna automaticamente uno libre.</div>

          {confirmed && (
            <div className="mt-6 rounded-lg border border-teal-400/30 bg-teal-400/10 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 text-teal" />
                <div>
                  <h3 className="text-xl font-bold text-white">Turno confirmado</h3>
                  <p className="mt-2 text-sm leading-6 text-teal-50">{appointmentMessage(confirmed, "Turno reservado")}</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <a className="btn-primary" href={whatsappUrl(bootstrap.business?.phone, appointmentMessage(confirmed))} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Enviar por WhatsApp</a>
                    <Link className="btn-secondary" to="/mis-reservas">Ver mis reservas</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
