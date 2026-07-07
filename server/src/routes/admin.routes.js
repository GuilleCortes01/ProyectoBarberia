import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { toDateOnly } from "../utils/schedule.js";

const router = Router();
router.use(requireAuth, requireAdmin);

const barberSchema = z.object({
  name: z.string().min(2),
  specialty: z.string().min(2),
  description: z.string().min(5),
  instagram: z.string().min(2),
  reference: z.string().min(2),
  photoUrl: z.string().url(),
  active: z.boolean().optional()
});

const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  durationMin: z.coerce.number().int().min(15),
  price: z.coerce.number().min(0),
  active: z.boolean().optional()
});

const availabilitySchema = z.object({
  availability: z.array(z.object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    slotMinutes: z.coerce.number().int().min(15).max(180),
    active: z.boolean().default(true)
  })).min(1)
});

const occupyingStatuses = ["PENDING", "CONFIRMED"];

router.get("/summary", async (req, res, next) => {
  try {
    const date = req.query.date ? String(req.query.date) : new Date().toISOString().slice(0, 10);
    const dateOnly = toDateOnly(date);

    const [appointments, barbers] = await Promise.all([
      prisma.appointment.findMany({
        where: { date: dateOnly },
        include: { barber: true, service: true, client: { select: { name: true, phone: true, email: true } } },
        orderBy: { time: "asc" }
      }),
      prisma.barber.findMany({ where: { active: true } })
    ]);

    const occupiedAppointments = appointments.filter((item) => occupyingStatuses.includes(item.status));
    const finishedAppointments = appointments.filter((item) => item.status === "FINISHED");
    const cancelledAppointments = appointments.filter((item) => item.status === "CANCELLED");
    const clientCancelledAppointments = cancelledAppointments.filter((item) => item.cancelledBy === "CLIENT");
    const activeBarbers = new Set(occupiedAppointments.map((item) => item.barberId));
    const barberStats = barbers.map((barber) => {
      const barberFinished = finishedAppointments.filter((item) => item.barberId === barber.id);
      const revenue = barberFinished.reduce((total, item) => total + Number(item.service.price), 0);

      return {
        barberId: barber.id,
        barberName: barber.name,
        cuts: barberFinished.length,
        revenue,
        occupied: occupiedAppointments.filter((item) => item.barberId === barber.id).length
      };
    });

    res.json({
      date,
      cuts: finishedAppointments.length,
      appointments: appointments.length,
      occupied: occupiedAppointments.length,
      cancelled: cancelledAppointments.length,
      clientCancelled: clientCancelledAppointments.length,
      cancellationRate: appointments.length ? Math.round((cancelledAppointments.length / appointments.length) * 100) : 0,
      clientCancellationRate: appointments.length ? Math.round((clientCancelledAppointments.length / appointments.length) * 100) : 0,
      availableBarbers: Math.max(barbers.length - activeBarbers.size, 0),
      barbers: barbers.length,
      revenue: barberStats.reduce((total, item) => total + item.revenue, 0),
      barberStats
    });
  } catch (error) {
    next(error);
  }
});

router.get("/appointments", async (req, res, next) => {
  try {
    const where = {};
    if (req.query.date) where.date = toDateOnly(String(req.query.date));
    if (req.query.barberId) where.barberId = String(req.query.barberId);

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        barber: true,
        service: true,
        client: { select: { id: true, name: true, email: true, phone: true } }
      },
      orderBy: [{ date: "asc" }, { time: "asc" }]
    });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.patch("/appointments/:id/status", async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "FINISHED"]) }).parse(req.body);
    const current = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ message: "Reserva no encontrada." });
    if (current.status === "CANCELLED" && status === "FINISHED") {
      return res.status(400).json({ message: "Una reserva cancelada no puede marcarse como finalizada." });
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        status,
        cancelledBy: status === "CANCELLED" ? "ADMIN" : null,
        hiddenFromClient: false
      },
      include: { barber: true, service: true, client: { select: { name: true, phone: true, email: true } } }
    });
    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

router.patch("/appointments/:id/barber", async (req, res, next) => {
  try {
    const { barberId } = z.object({ barberId: z.string().min(1) }).parse(req.body);
    const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!appointment) return res.status(404).json({ message: "Reserva no encontrada." });
    if (["CANCELLED", "FINISHED"].includes(appointment.status)) {
      return res.status(400).json({ message: "Solo se puede cambiar el barbero de reservas pendientes o confirmadas." });
    }

    const barber = await prisma.barber.findFirst({ where: { id: barberId, active: true } });
    if (!barber) return res.status(404).json({ message: "Barbero no encontrado o inactivo." });

    const conflict = await prisma.appointment.findFirst({
      where: {
        id: { not: appointment.id },
        barberId,
        date: appointment.date,
        time: appointment.time,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    });

    if (conflict) {
      return res.status(409).json({ message: "Ese barbero ya tiene un turno activo en ese horario." });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { barberId },
      include: {
        barber: true,
        service: true,
        client: { select: { id: true, name: true, email: true, phone: true } }
      }
    });

    res.json(updated);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Ese barbero ya tiene un turno en ese horario." });
    }
    next(error);
  }
});

router.get("/barbers", async (_req, res, next) => {
  try {
    res.json(await prisma.barber.findMany({ include: { availability: true }, orderBy: { createdAt: "asc" } }));
  } catch (error) {
    next(error);
  }
});

router.post("/barbers", async (req, res, next) => {
  try {
    const data = barberSchema.parse(req.body);
    const barber = await prisma.barber.create({ data });
    res.status(201).json(barber);
  } catch (error) {
    next(error);
  }
});

router.put("/barbers/:id", async (req, res, next) => {
  try {
    const data = barberSchema.partial().parse(req.body);
    res.json(await prisma.barber.update({ where: { id: req.params.id }, data }));
  } catch (error) {
    next(error);
  }
});

router.delete("/barbers/:id", async (req, res, next) => {
  try {
    res.json(await prisma.barber.update({ where: { id: req.params.id }, data: { active: false } }));
  } catch (error) {
    next(error);
  }
});

router.put("/barbers/:id/availability", async (req, res, next) => {
  try {
    const { availability } = availabilitySchema.parse(req.body);
    const barber = await prisma.barber.findUnique({ where: { id: req.params.id } });
    if (!barber) return res.status(404).json({ message: "Barbero no encontrado." });

    await prisma.$transaction([
      prisma.barberAvailability.deleteMany({ where: { barberId: barber.id } }),
      prisma.barberAvailability.createMany({
        data: availability.map((item) => ({ ...item, barberId: barber.id }))
      })
    ]);

    const updated = await prisma.barber.findUnique({
      where: { id: barber.id },
      include: { availability: true }
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get("/services", async (_req, res, next) => {
  try {
    res.json(await prisma.service.findMany({ orderBy: { price: "asc" } }));
  } catch (error) {
    next(error);
  }
});

router.post("/services", async (req, res, next) => {
  try {
    const data = serviceSchema.parse(req.body);
    const service = await prisma.service.create({ data });
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

router.put("/services/:id", async (req, res, next) => {
  try {
    const data = serviceSchema.partial().parse(req.body);
    res.json(await prisma.service.update({ where: { id: req.params.id }, data }));
  } catch (error) {
    next(error);
  }
});

router.delete("/services/:id", async (req, res, next) => {
  try {
    res.json(await prisma.service.update({ where: { id: req.params.id }, data: { active: false } }));
  } catch (error) {
    next(error);
  }
});

export default router;
