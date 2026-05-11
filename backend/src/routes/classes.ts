import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../prisma.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        students: { include: { role: true }, select: { id: true, name: true, email: true, role: true } as any },
        _count: { select: { students: true, assignments: true } },
      },
      orderBy: [{ year: "desc" }, { name: "asc" }],
    });
    res.json(classes);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const cls = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: {
        students: { include: { role: true } },
        assignments: { include: { subject: true, teacher: true } },
      },
    });
    if (!cls) { res.status(404).json({ message: "Class not found" }); return; }
    res.json(cls);
  } catch (error) {
    next(error);
  }
});

const createClassSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  name: z.string().min(1).max(5),
});

router.post("/", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const body = createClassSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }
    const cls = await prisma.class.create({ data: body.data });
    res.status(201).json(cls);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    await prisma.class.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
