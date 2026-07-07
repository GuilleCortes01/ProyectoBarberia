import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import AdminNav from "../components/AdminNav";

export default function AdminCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/admin/appointments").then(({ data }) => {
      setEvents(data.map((item) => ({
        id: item.id,
        title: `${item.time} ${item.client.name} - ${item.service.name}`,
        start: `${item.date.slice(0, 10)}T${item.time}:00`,
        color: item.status === "CANCELLED" ? "#ef4444" : item.status === "CONFIRMED" ? "#2dd4bf" : "#d5a64c"
      })));
    });
  }, []);

  return <section className="container-page py-16"><AdminNav /><div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Calendario</p><h1 className="section-title">Reservas</h1></div><div className="glass-panel rounded-lg p-4"><FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }} events={events} height="auto" /></div></section>;
}
