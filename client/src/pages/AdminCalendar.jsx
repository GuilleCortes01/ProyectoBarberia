import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import AdminNav from "../components/AdminNav";

export default function AdminCalendar() {
  const [events, setEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 640);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return (
    <section className="container-page py-10 sm:py-16">
      <AdminNav />
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Calendario</p>
        <h1 className="section-title">Reservas</h1>
      </div>
      <div className="glass-panel overflow-hidden rounded-lg p-3 sm:p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[620px] sm:min-w-0">
            <FullCalendar
              key={isMobile ? "mobile" : "desktop"}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? "timeGridDay" : "dayGridMonth"}
              headerToolbar={isMobile ? { left: "prev,next", center: "title", right: "today" } : { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
              events={events}
              height="auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
