import { CalendarDays, LayoutDashboard, Scissors, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard },
  { to: "/admin/calendario", label: "Calendario", icon: CalendarDays },
  { to: "/admin/barberos", label: "Barberos", icon: Scissors },
  { to: "/admin/servicios", label: "Servicios", icon: Sparkles }
];

export default function AdminNav() {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === "/admin"} className={({ isActive }) => `inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition ${isActive ? "border-gold bg-gold text-ink" : "border-white/10 bg-white/5 text-slate-200 hover:border-gold/60"}`}>
          <Icon size={16} /> {label}
        </NavLink>
      ))}
    </div>
  );
}
