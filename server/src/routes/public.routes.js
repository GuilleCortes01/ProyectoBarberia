import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/bootstrap", async (_req, res, next) => {
  try {
    const [business, barbers, services] = await Promise.all([
      prisma.businessInfo.findFirst(),
      prisma.barber.findMany({
        where: { active: true },
        include: { availability: true },
        orderBy: { createdAt: "asc" }
      }),
      prisma.service.findMany({ where: { active: true }, orderBy: { price: "asc" } })
    ]);

    res.json({ business, barbers, services });
  } catch (error) {
    next(error);
  }
});

export default router;
