import { Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../api/client";
import AdminNav from "../components/AdminNav";

const empty = { name: "", specialty: "", description: "", instagram: "", reference: "", photoUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80", active: true };

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm({ defaultValues: empty });

  async function load() {
    const { data } = await api.get("/admin/barbers");
    setBarbers(data);
  }

  useEffect(() => { load(); }, []);

  function edit(barber) {
    setEditing(barber.id);
    reset(barber);
  }

  async function onSubmit(values) {
    if (editing) await api.put(`/admin/barbers/${editing}`, values);
    else await api.post("/admin/barbers", values);
    setEditing(null);
    reset(empty);
    load();
  }

  async function remove(id) {
    await api.delete(`/admin/barbers/${id}`);
    load();
  }

  return <section className="container-page py-16"><AdminNav /><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Gestion</p><h1 className="section-title">Barberos</h1></div><div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]"><form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-lg p-6"><h2 className="mb-5 text-xl font-bold">{editing ? "Editar barbero" : "Nuevo barbero"}</h2><div className="grid gap-4"><input className="input" placeholder="Nombre" {...register("name", { required: true })} /><input className="input" placeholder="Especialidad" {...register("specialty", { required: true })} /><textarea className="input min-h-24" placeholder="Descripcion" {...register("description", { required: true })} /><input className="input" placeholder="Instagram" {...register("instagram", { required: true })} /><input className="input" placeholder="Referencia" {...register("reference", { required: true })} /><input className="input" placeholder="URL foto" {...register("photoUrl", { required: true })} /><button className="btn-primary" type="submit"><Plus size={18} /> {editing ? "Guardar cambios" : "Crear barbero"}</button>{editing && <button className="btn-secondary" type="button" onClick={() => { setEditing(null); reset(empty); }}>Cancelar edicion</button>}</div></form><div className="grid gap-4">{barbers.map((barber) => <article key={barber.id} className="glass-panel grid gap-4 rounded-lg p-4 sm:grid-cols-[120px_1fr_auto]"><img src={barber.photoUrl} className="h-28 w-full rounded-md object-cover sm:w-28" alt={barber.name} /><div><h3 className="text-lg font-bold">{barber.name}</h3><p className="text-sm text-gold">{barber.specialty}</p><p className="mt-2 text-sm text-slate-400">{barber.reference}</p><p className="mt-1 text-xs text-slate-500">{barber.active ? "Activo" : "Inactivo"}</p></div><div className="flex gap-2 sm:flex-col"><button className="btn-secondary px-3" onClick={() => edit(barber)} aria-label="Editar"><Edit3 size={16} /></button><button className="btn-secondary px-3" onClick={() => remove(barber.id)} aria-label="Eliminar"><Trash2 size={16} /></button></div></article>)}</div></div></section>;
}
