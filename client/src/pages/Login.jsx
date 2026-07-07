import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { email: "admin@urbanbarber.com", password: "admin123" } });
  const [error, setError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(values) {
    setError("");
    try {
      const user = await auth.login({
        email: values.email.trim(),
        password: values.password.trim()
      });
      const from = location.state?.from?.pathname;
      const clientOnlyPaths = ["/reservar", "/mis-reservas", "/perfil"];
      if (user.role === "ADMIN" && clientOnlyPaths.includes(from)) {
        navigate("/");
        return;
      }
      navigate(from || (user.role === "ADMIN" ? "/admin" : "/perfil"));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function fillDemo(email, password) {
    reset({ email, password });
  }

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel w-full max-w-md rounded-lg p-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Acceso</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Iniciar sesion</h1>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button className="btn-secondary px-3 py-2" type="button" onClick={() => fillDemo("admin@urbanbarber.com", "admin123")}>Admin demo</button>
          <button className="btn-secondary px-3 py-2" type="button" onClick={() => fillDemo("cliente@demo.com", "cliente123")}>Cliente demo</button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" autoComplete="email" {...register("email", { required: true })} />
          </div>
          <div>
            <label className="label">Contrasena</label>
            <input className="input" type="password" autoComplete="current-password" {...register("password", { required: true })} />
          </div>
          {error && <p className="rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
          <button className="btn-primary w-full" type="submit">Ingresar</button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-400">No tenes cuenta? <Link className="text-gold" to="/registro">Registrate</Link></p>
      </form>
    </section>
  );
}
