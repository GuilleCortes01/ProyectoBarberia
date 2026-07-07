import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { buildSlots, getDayOfWeek, toDateOnly } from "../utils/schedule.js";

const router = Router();

async function getAvailableSlots({ date, barberId }) {
  const dayOfWeek = getDayOfWeek(date);
  const dateOnly = toDateOnly(date);

  const barbers = await prisma.barber.findMany({
    where: {
      active: true,
      ...(barberId ? { id: barberId } : {}),
      availability: { some: { dayOfWeek, active: true } }
    },
    include: { availability: { where: { dayOfWeek, active: true } } }
  });

  const appointments = await prisma.appointment.findMany({
    where: {
      date: dateOnly,
      status: { not: "CANCELLED" },
      barberId: { in: barbers.map((barber) => barber.id) }
    },
    select: { barberId: true, time: true }
  });

  const occupied = new Set(appointments.map((item) => `${item.barberId}-${item.time}`));

  return barbers.map((barber) => {
    const availability = barber.availability[0];
    const slots = buildSlots(availability.startTime, availability.endTime, availability.slotMinutes)
      .map((time) => ({
        time,
        barberId: barber.id,
        barberName: barber.name,
        available: !occupied.has(`${barber.id}-${time}`)
      }));

    return { barber, slots };
  });
}

router.get("/availability", async (req, res, next) => {
  try {
    const query = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      barberId: z.string().optional(),
      serviceId: z.string().optional()
    }).parse(req.query);

    const byBarber = await getAvailableSlots(query);
    const slots = byBarber.flatMap((item) => item.slots);
    const groupedByTime = slots.reduce((acc, slot) => {
      if (!slot.available) return acc;
      acc[slot.time] ??= [];
      acc[slot.time].push({ barberId: slot.barberId, barberName: slot.barberName });
      return acc;
    }, {});

    res.json({
      byBarber,
      slots,
      times: Object.entries(groupedByTime).map(([time, barbers]) => ({ time, barbers }))
    });
  } catch (error) {
    next(error);
  }
});

router.use(requireAuth);

router.get("/mine", async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { clientId: req.user.id, hiddenFromClient: false },
      include: { barber: true, service: true },
      orderBy: [{ date: "desc" }, { time: "desc" }]
    });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = z.object({
      serviceId: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().regex(/^\d{2}:\d{2}$/),
      barberId: z.string().optional(),
      anyBarber: z.boolean().default(false),
      notes: z.string().optional()
    }).parse(req.body);

    const availability = await getAvailableSlots({ date: data.date, barberId: data.anyBarber ? undefined : data.barberId });
    const availableSlot = availability
      .flatMap((item) => item.slots)
      .find((slot) => slot.time === data.time && slot.available && (data.anyBarber || slot.barberId === data.barberId));

    if (!availableSlot) {
      return res.status(409).json({ message: "Ese horario ya no esta disponible." });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: req.user.id,
        serviceId: data.serviceId,
        barberId: availableSlot.barberId,
        date: toDateOnly(data.date),
        time: data.time,
        anyBarber: data.anyBarber,
        notes: data.notes
      },
      include: { barber: true, service: true, client: { select: { id: true, name: true, email: true, phone: true } } }
    });

    res.status(201).json(appointment);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Ese horario acaba de ser reservado." });
    }
    next(error);
  }
});

router.patch("/:id/cancel", async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findFirst({ where: { id: req.params.id, clientId: req.user.id } });
    if (!appointment) return res.status(404).json({ message: "Reserva no encontrada." });
    if (["FINISHED", "CANCELLED"].includes(appointment.status)) {
      return res.status(400).json({ message: "La reserva no se puede cancelar." });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELLED", cancelledBy: "CLIENT" },
      include: { barber: true, service: true }
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findFirst({ where: { id: req.params.id, clientId: req.user.id } });
    if (!appointment) return res.status(404).json({ message: "Reserva no encontrada." });
    if (appointment.status !== "CANCELLED") {
      return res.status(400).json({ message: "Solo se pueden eliminar reservas canceladas." });
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { hiddenFromClient: true }
    });
    res.json({ message: "Reserva eliminada de tu vista." });
  } catch (error) {
    next(error);
  }
});

export default router;
