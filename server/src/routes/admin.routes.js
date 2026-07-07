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

    const occupied = appointments.filter((item) => item.status !== "CANCELLED").length;
    const finished = appointments.filter((item) => item.status === "FINISHED").length;
    const activeBarbers = new Set(appointments.filter((item) => item.status !== "CANCELLED").map((item) => item.barberId));

    res.json({
      date,
      cuts: finished,
      appointments: appointments.length,
      occupied,
      availableBarbers: Math.max(barbers.length - activeBarbers.size, 0),
      barbers: barbers.length
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
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
      include: { barber: true, service: true, client: { select: { name: true, phone: true, email: true } } }
    });
    res.json(appointment);
  } catch (error) {
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
