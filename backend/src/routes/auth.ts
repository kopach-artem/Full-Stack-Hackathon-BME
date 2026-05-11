import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: "Invalid email or password format" });
      return;
    }
    const { email, password } = body.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, class: true },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role.name, class: user.class },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { role: true, class: true },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      class: user.class,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
