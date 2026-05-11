import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../prisma.js";

const router = Router();
router.use(authenticate);

router.get("/", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const { role } = req.query as { role?: string };
    const users = await prisma.user.findMany({
      where: role ? { role: { name: role as any } } : undefined,
      include: { role: true, class: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users.map(({ passwordHash: _, ...u }) => u));
  } catch (error) {
    next(error);
  }
});

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["SUPERADMIN", "ADMIN", "TEACHER", "STUDENT"]),
  classId: z.string().optional(),
});

router.post("/", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const body = createUserSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: "Invalid request", errors: body.error.flatten() });
      return;
    }
    const { email, name, password, role, classId } = body.data;

    if (req.user!.role === "ADMIN" && (role === "ADMIN" || role === "SUPERADMIN")) {
      res.status(403).json({ message: "Admins cannot create admin-level users" });
      return;
    }

    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) {
      res.status(400).json({ message: "Role not found" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, roleId: roleRecord.id, classId },
      include: { role: true, class: true },
    });
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    next(error);
  }
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  classId: z.string().nullable().optional(),
});

router.put("/:id", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const body = updateUserSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: body.data,
      include: { role: true, class: true },
    });
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
