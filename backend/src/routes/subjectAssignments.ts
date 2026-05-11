import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../prisma.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const { classId, teacherId, academicYear, subjectId } = req.query as Record<string, string>;

    const user = req.user!;
    const effectiveTeacherId = user.role === "TEACHER" ? user.id : teacherId;

    // Students can only see assignments for their own class
    let effectiveClassId = classId;
    if (user.role === "STUDENT") {
      const student = await prisma.user.findUnique({ where: { id: user.id } });
      if (!student?.classId) {
        res.json([]);
        return;
      }
      effectiveClassId = student.classId;
    }

    const assignments = await prisma.subjectAssignment.findMany({
      where: {
        ...(subjectId && { subjectId }),
        ...(effectiveClassId && { classId: effectiveClassId }),
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      res.status(400).json({ message: "This subject is already assigned to this class for that academic year" });
      return;
    }
    next(error);
  }
});

const updateSchema = z.object({
  teacherId: z.string().optional(),
  academicYear: z.number().int().min(2000).max(2100).optional(),
});

router.put("/:id", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const body = updateSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }
    const assignment = await prisma.subjectAssignment.update({
      where: { id: req.params.id },
      data: body.data,
      include: { subject: true, class: true, teacher: { select: { id: true, name: true, email: true } } },
    });
    res.json(assignment);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      res.status(400).json({ message: "This subject is already assigned to this class for that academic year" });
      return;
    }
    next(error);
  }
});

router.delete("/:id", requireRole("ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const count = await prisma.grade.count({ where: { subjectAssignmentId: req.params.id } });
    if (count > 0) {
      res.status(400).json({ message: `Cannot delete assignment — it has ${count} grade(s). Delete grades first.` });
      return;
    }
    await prisma.subjectAssignment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
