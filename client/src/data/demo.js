export const demoBarbers = [
  {
    id: "demo-mateo",
    name: "Mateo Ruiz",
    specialty: "Degradados, fade y cortes modernos",
    description: "Tecnica limpia, terminaciones marcadas y asesoramiento para estilos actuales.",
    instagram: "@mateobarber",
    reference: "5 años de experiencia",
    photoUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "demo-lucas",
    name: "Lucas Fernandez",
    specialty: "Barba, perfilado y cortes clasicos",
    description: "Especialista en barberia tradicional, afeitado prolijo y perfiles definidos.",
    instagram: "@lucasbarber",
    reference: "Especialista en barberia tradicional",
    photoUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "demo-nico",
    name: "Nicolas Herrera",
    specialty: "Disenos, freestyle y cortes juveniles",
    description: "Trabajos personalizados, lineas creativas y cortes con identidad propia.",
    instagram: "@nico.cuts",
    reference: "Trabajos personalizados y modernos",
    photoUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80"
  }
];

export const demoServices = [
  { id: "demo-clasico", name: "Corte clasico", description: "Corte prolijo con tijera y maquina, ideal para estilo diario.", durationMin: 30, price: 6500 },
  { id: "demo-fade", name: "Corte fade", description: "Degrade moderno con terminacion premium y styling final.", durationMin: 45, price: 8000 },
  { id: "demo-combo", name: "Corte + barba", description: "Servicio completo con corte, perfilado y cuidado de barba.", durationMin: 60, price: 10500 },
  { id: "demo-barba", name: "Perfilado de barba", description: "Contorno, rebaje y terminacion con productos profesionales.", durationMin: 30, price: 5000 },
  { id: "demo-infantil", name: "Corte infantil", description: "Corte comodo y rapido para chicos, con paciencia y buen trato.", durationMin: 30, price: 5500 },
  { id: "demo-diseno", name: "Diseno personalizado", description: "Freestyle, lineas, dibujos y estilos juveniles a medida.", durationMin: 60, price: 12000 }
];

export const demoBootstrap = {
  business: {
    name: "Urban Barber Studio",
    tagline: "Cortes precisos, estilo urbano y una experiencia premium en cada turno."
  },
  barbers: demoBarbers,
  services: demoServices
};

export function buildDemoAvailability(barberId) {
  const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "12:00", "15:00", "15:30", "16:00", "17:00"];
  const barbers = barberId ? demoBarbers.filter((barber) => barber.id === barberId) : demoBarbers;
  const slots = barbers.flatMap((barber) => times.map((time, index) => ({
    time,
    barberId: barber.id,
    barberName: barber.name,
    available: index % 5 !== 3
  })));
  const grouped = times.map((time) => ({
    time,
    barbers: slots.filter((slot) => slot.time === time && slot.available).map((slot) => ({ barberId: slot.barberId, barberName: slot.barberName }))
  })).filter((item) => item.barbers.length > 0);

  return { slots, times: grouped, byBarber: [] };
}
