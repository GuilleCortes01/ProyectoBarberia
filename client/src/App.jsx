import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminBarbers from "./pages/AdminBarbers";
import AdminCalendar from "./pages/AdminCalendar";
import AdminDashboard from "./pages/AdminDashboard";
import AdminServices from "./pages/AdminServices";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="reservar" element={<ProtectedRoute clientOnly><Booking /></ProtectedRoute>} />
        <Route path="perfil" element={<ProtectedRoute clientOnly><Profile /></ProtectedRoute>} />
        <Route path="mis-reservas" element={<ProtectedRoute clientOnly><MyAppointments /></ProtectedRoute>} />
        <Route path="contacto" element={<Contact />} />
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/calendario" element={<ProtectedRoute adminOnly><AdminCalendar /></ProtectedRoute>} />
        <Route path="admin/barberos" element={<ProtectedRoute adminOnly><AdminBarbers /></ProtectedRoute>} />
        <Route path="admin/servicios" element={<ProtectedRoute adminOnly><AdminServices /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
