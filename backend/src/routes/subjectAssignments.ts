import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../prisma.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const { classId, teacherId, academicYear } = req.query as Record<string, string>;

    const user = req.user!;
    const effectiveTeacherId = user.role === "TEACHER" ? user.id : teacherId;

    const assignments = await prisma.subjectAssignment.findMany({
      where: {
        ...(classId && { classId }),
        ...(effectiveTeacherId && { teacherId: effectiveTeacherId }),
        ...(academicYear && { academicYear: parseInt(academicYear) }),
      },
      include: {
        subject: true,
        class: true,
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { grades: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
});

const createSchema = z.object({
  subjectId: z.string(),
  classId: z.string(),
  teacherId: z.string(),
  academicYear: z.number().int().min(2000).max(2100),
});

router.post("/", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const body = createSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: "Invalid request", errors: body.error.flatten() });
      return;
    }
    const assignment = await prisma.subjectAssignment.create({
      data: body.data,
      include: { subject: true, class: true, teacher: true },
    });
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    await prisma.subjectAssignment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
