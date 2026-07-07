import { Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../api/client";
import AdminNav from "../components/AdminNav";

const empty = { name: "", description: "", durationMin: 30, price: 0, active: true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm({ defaultValues: empty });

  async function load() {
    const { data } = await api.get("/admin/services");
    setServices(data);
  }

  useEffect(() => { load(); }, []);

  function edit(service) {
    setEditing(service.id);
    reset({ ...service, price: Number(service.price) });
  }

  async function onSubmit(values) {
    const payload = { ...values, durationMin: Number(values.durationMin), price: Number(values.price) };
    if (editing) await api.put(`/admin/services/${editing}`, payload);
    else await api.post("/admin/services", payload);
    setEditing(null);
    reset(empty);
    load();
  }

  async function remove(id) {
    await api.delete(`/admin/services/${id}`);
    load();
  }

  return <section className="container-page py-16"><AdminNav /><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Gestion</p><h1 className="section-title">Servicios</h1></div><div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]"><form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-lg p-6"><h2 className="mb-5 text-xl font-bold">{editing ? "Editar servicio" : "Nuevo servicio"}</h2><div className="grid gap-4"><input className="input" placeholder="Nombre" {...register("name", { required: true })} /><textarea className="input min-h-24" placeholder="Descripcion" {...register("description", { required: true })} /><input className="input" type="number" placeholder="Duracion en minutos" {...register("durationMin", { required: true })} /><input className="input" type="number" placeholder="Precio" {...register("price", { required: true })} /><button className="btn-primary" type="submit"><Plus size={18} /> {editing ? "Guardar cambios" : "Crear servicio"}</button>{editing && <button className="btn-secondary" type="button" onClick={() => { setEditing(null); reset(empty); }}>Cancelar edicion</button>}</div></form><div className="grid gap-4 sm:grid-cols-2">{services.map((service) => <article key={service.id} className="glass-panel rounded-lg p-5"><div className="mb-4 flex items-start justify-between gap-4"><div><h3 className="text-lg font-bold">{service.name}</h3><p className="text-sm text-gold">${Number(service.price).toLocaleString("es-AR")} - {service.durationMin} min</p></div><span className="text-xs text-slate-500">{service.active ? "Activo" : "Inactivo"}</span></div><p className="min-h-16 text-sm text-slate-400">{service.description}</p><div className="mt-4 flex gap-2"><button className="btn-secondary px-3" onClick={() => edit(service)} aria-label="Editar"><Edit3 size={16} /></button><button className="btn-secondary px-3" onClick={() => remove(service.id)} aria-label="Eliminar"><Trash2 size={16} /></button></div></article>)}</div></div></section>;
}
