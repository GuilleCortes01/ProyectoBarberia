const styles = {
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  CONFIRMED: "border-teal-400/30 bg-teal-400/10 text-teal-200",
  CANCELLED: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  FINISHED: "border-slate-300/30 bg-slate-300/10 text-slate-200"
};

const labels = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  FINISHED: "Finalizada"
};

export default function StatusBadge({ status }) {
  return <span className={`rounded-full border px-3 py-1 text-xs font-bold ${styles[status]}`}>{labels[status] || status}</span>;
}
