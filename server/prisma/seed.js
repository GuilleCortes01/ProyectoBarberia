import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const photos = {
  mateo: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  lucas: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80",
  nico: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80"
};

async function main() {
  await prisma.businessInfo.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.barberAvailability.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const [adminPassword, clientPassword] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("cliente123", 10)
  ]);

  await prisma.user.createMany({
    data: [
      { name: "Admin Urban", email: "admin@urbanbarber.com", phone: "+54 381 555-0101", passwordHash: adminPassword, role: "ADMIN" },
      { name: "Cliente Demo", email: "cliente@demo.com", phone: "+54 381 555-0202", passwordHash: clientPassword, role: "CLIENT" },
      { name: "Sofia Molina", email: "sofia@demo.com", phone: "+54 381 555-0301", passwordHash: clientPassword, role: "CLIENT" },
      { name: "Bruno Perez", email: "bruno@demo.com", phone: "+54 381 555-0302", passwordHash: clientPassword, role: "CLIENT" },
      { name: "Tomas Alvarez", email: "tomas@demo.com", phone: "+54 381 555-0303", passwordHash: clientPassword, role: "CLIENT" },
      { name: "Valentin Rios", email: "valentin@demo.com", phone: "+54 381 555-0304", passwordHash: clientPassword, role: "CLIENT" }
    ]
  });

  await prisma.businessInfo.create({
    data: {
      name: "Urban Barber Studio",
      tagline: "Cortes precisos, estilo urbano y una experiencia premium en cada turno.",
      phone: "+54 381 555-1234",
      email: "hola@urbanbarber.com",
      address: "Av. Principal 1240, San Miguel de Tucuman",
      instagram: "@urbanbarberstudio",
      mapUrl: "https://maps.google.com",
      openingText: "Lunes a sabado de 09:00 a 18:00"
    }
  });

  const barbers = await Promise.all([
    prisma.barber.create({
      data: {
        name: "Mateo Ruiz",
        specialty: "Degradados, fade y cortes modernos",
        description: "Tecnica limpia, terminaciones marcadas y asesoramiento para estilos actuales.",
        instagram: "@mateobarber",
        reference: "5 años de experiencia",
        photoUrl: photos.mateo
      }
    }),
    prisma.barber.create({
      data: {
        name: "Lucas Fernandez",
        specialty: "Barba, perfilado y cortes clasicos",
        description: "Especialista en barberia tradicional, afeitado prolijo y perfiles definidos.",
        instagram: "@lucasbarber",
        reference: "Especialista en barberia tradicional",
        photoUrl: photos.lucas
      }
    }),
    prisma.barber.create({
      data: {
        name: "Nicolas Herrera",
        specialty: "Disenos, freestyle y cortes juveniles",
        description: "Trabajos personalizados, lineas creativas y cortes con identidad propia.",
        instagram: "@nico.cuts",
        reference: "Trabajos personalizados y modernos",
        photoUrl: photos.nico
      }
    })
  ]);

  await prisma.service.createMany({
    data: [
      { name: "Corte clasico", description: "Corte prolijo con tijera y maquina, ideal para estilo diario.", durationMin: 30, price: 6500 },
      { name: "Corte fade", description: "Degrade moderno con terminacion premium y styling final.", durationMin: 45, price: 8000 },
      { name: "Corte + barba", description: "Servicio completo con corte, perfilado y cuidado de barba.", durationMin: 60, price: 10500 },
      { name: "Perfilado de barba", description: "Contorno, rebaje y terminacion con productos profesionales.", durationMin: 30, price: 5000 },
      { name: "Corte infantil", description: "Corte comodo y rapido para chicos, con paciencia y buen trato.", durationMin: 30, price: 5500 },
      { name: "Diseno personalizado", description: "Freestyle, lineas, dibujos y estilos juveniles a medida.", durationMin: 60, price: 12000 }
    ]
  });

  const availability = [];
  for (const barber of barbers) {
    for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
      availability.push({ barberId: barber.id, dayOfWeek, startTime: "09:00", endTime: "18:00", slotMinutes: 30 });
    }
  }
  await prisma.barberAvailability.createMany({ data: availability });

  const services = await prisma.service.findMany({ orderBy: { price: "asc" } });
  const clients = await prisma.user.findMany({ where: { role: "CLIENT" }, orderBy: { createdAt: "asc" } });
  const byService = Object.fromEntries(services.map((service) => [service.name, service]));
  const today = new Date();
  const dateOnly = (offset = 0) => new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + offset));

  await prisma.appointment.createMany({
    data: [
      {
        clientId: clients[0].id,
        barberId: barbers[0].id,
        serviceId: byService["Corte fade"].id,
        date: dateOnly(0),
        time: "09:00",
        status: "FINISHED",
        anyBarber: false
      },
      {
        clientId: clients[1].id,
        barberId: barbers[1].id,
        serviceId: byService["Corte + barba"].id,
        date: dateOnly(0),
        time: "10:00",
        status: "FINISHED",
        anyBarber: true
      },
      {
        clientId: clients[2].id,
        barberId: barbers[2].id,
        serviceId: byService["Perfilado de barba"].id,
        date: dateOnly(0),
        time: "11:30",
        status: "CONFIRMED",
        anyBarber: false
      },
      {
        clientId: clients[3].id,
        barberId: barbers[0].id,
        serviceId: byService["Diseno personalizado"].id,
        date: dateOnly(0),
        time: "15:00",
        status: "PENDING",
        anyBarber: true
      },
      {
        clientId: clients[4].id,
        barberId: barbers[1].id,
        serviceId: byService["Corte clasico"].id,
        date: dateOnly(0),
        time: "16:30",
        status: "CANCELLED",
        anyBarber: false,
        cancelledBy: "CLIENT"
      },
      {
        clientId: clients[1].id,
        barberId: barbers[2].id,
        serviceId: byService["Corte infantil"].id,
        date: dateOnly(0),
        time: "17:00",
        status: "CANCELLED",
        anyBarber: false,
        cancelledBy: "ADMIN"
      },
      {
        clientId: clients[2].id,
        barberId: barbers[0].id,
        serviceId: byService["Corte + barba"].id,
        date: dateOnly(1),
        time: "09:30",
        status: "CONFIRMED",
        anyBarber: true
      },
      {
        clientId: clients[3].id,
        barberId: barbers[1].id,
        serviceId: byService["Corte fade"].id,
        date: dateOnly(1),
        time: "12:00",
        status: "PENDING",
        anyBarber: false
      }
    ]
  });

  console.log("Seed listo: Urban Barber Studio demo cargado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
