import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false, clientOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container-page py-32 text-slate-300">Cargando sesion...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/perfil" replace />;
  if (clientOnly && isAdmin) return <Navigate to="/" replace />;

  return children;
}
