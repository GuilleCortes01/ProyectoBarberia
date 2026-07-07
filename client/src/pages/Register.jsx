import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  async function onSubmit(values) {
    try {
      await auth.register(values);
      navigate("/reservar");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return <section className="container-page grid min-h-[70vh] place-items-center py-16"><form onSubmit={handleSubmit(onSubmit)} className="glass-panel w-full max-w-xl rounded-lg p-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Cliente</p><h1 className="mt-2 font-display text-4xl font-bold">Crear cuenta</h1><div className="mt-8 grid gap-4 sm:grid-cols-2"><div><label className="label">Nombre</label><input className="input" {...register("name", { required: true })} /></div><div><label className="label">Telefono</label><input className="input" {...register("phone")} /></div><div className="sm:col-span-2"><label className="label">Email</label><input className="input" type="email" {...register("email", { required: true })} /></div><div className="sm:col-span-2"><label className="label">Contrasena</label><input className="input" type="password" {...register("password", { required: true, minLength: 6 })} /></div>{error && <p className="rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200 sm:col-span-2">{error}</p>}<button className="btn-primary sm:col-span-2" type="submit">Registrarme</button></div><p className="mt-5 text-center text-sm text-slate-400">Ya tenes cuenta? <Link className="text-gold" to="/login">Ingresar</Link></p></form></section>;
}
