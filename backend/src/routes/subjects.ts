import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../prisma.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { assignments: true } } },
    });
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

const subjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  bookRequired: z.string().optional(),
});

router.post("/", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const body = subjectSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }
    const subject = await prisma.subject.create({ data: body.data });
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const body = subjectSchema.partial().safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: body.data,
    });
    res.json(subject);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
