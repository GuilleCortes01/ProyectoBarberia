import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const authSelect = { id: true, name: true, email: true, phone: true, role: true };

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2),
      email: z.string().trim().email(),
      phone: z.string().optional(),
      password: z.string().min(6)
    }).parse(req.body);

    const email = data.email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: "El email ya esta registrado." });

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        phone: data.phone,
        passwordHash: await bcrypt.hash(data.password, 10),
        role: "CLIENT"
      },
      select: authSelect
    });

    res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = z.object({
      email: z.string().trim().email(),
      password: z.string().min(1)
    }).parse(req.body);

    const email = data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Credenciales invalidas." });

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Credenciales invalidas." });

    const safeUser = { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
    res.json({ user: safeUser, token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
