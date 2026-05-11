import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../prisma.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const { studentId, subjectAssignmentId } = req.query as Record<string, string>;
    const user = req.user!;

    const effectiveStudentId = user.role === "STUDENT" ? user.id : studentId;

    // Teacher can only query grades for their own assignments
    let teacherAssignmentFilter: { subjectAssignmentId: { in: string[] } } | undefined;
    if (user.role === "TEACHER") {
      const myAssignments = await prisma.subjectAssignment.findMany({
        where: { teacherId: user.id },
        select: { id: true },
      });
      const myIds = myAssignments.map((a) => a.id);
      const requestedId = subjectAssignmentId;
      if (requestedId && !myIds.includes(requestedId)) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
      teacherAssignmentFilter = { subjectAssignmentId: { in: myIds } };
    }

    const grades = await prisma.grade.findMany({
      where: {
        ...(effectiveStudentId && { studentId: effectiveStudentId }),
        ...(subjectAssignmentId && { subjectAssignmentId }),
        ...(teacherAssignmentFilter && !subjectAssignmentId && teacherAssignmentFilter),
      },
      include: {
        subjectAssignment: {
          include: { subject: true, class: true },
        },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(grades);
  } catch (error) {
    next(error);
  }
});

const createGradeSchema = z.object({
  value: z.number().int().min(1).max(5),
  type: z.enum(["REGULAR", "SEMESTER", "YEAR_END"]).default("REGULAR"),
  weight: z.number().int().min(1).max(10).default(1),
  description: z.string().optional(),
  studentId: z.string(),
  subjectAssignmentId: z.string(),
});

router.post("/", requireRole("TEACHER", "ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const body = createGradeSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ message: "Invalid request", errors: body.error.flatten() });
      return;
    }

    const assignment = await prisma.subjectAssignment.findUnique({
      where: { id: body.data.subjectAssignmentId },
    });
    if (!assignment) {
      res.status(404).json({ message: "Subject assignment not found" });
      return;
    }
    if (req.user!.role === "TEACHER" && assignment.teacherId !== req.user!.id) {
      res.status(403).json({ message: "You can only enter grades for your own subject assignments" });
      return;
    }

    // Validate that the student belongs to the assignment's class
    const student = await prisma.user.findUnique({
      where: { id: body.data.studentId },
    });
    if (!student || student.classId !== assignment.classId) {
      res.status(400).json({ message: "Student is not enrolled in the class for this subject assignment" });
      return;
    }

    const grade = await prisma.grade.create({
      data: body.data,
      include: {
        subjectAssignment: { include: { subject: true } },
        student: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(grade);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireRole("TEACHER", "ADMIN", "SUPERADMIN"), async (req, res, next) => {
  try {
    const grade = await prisma.grade.findUnique({
      where: { id: req.params.id },
      include: { subjectAssignment: true },
    });
    if (!grade) {
      res.status(404).json({ message: "Grade not found" });
      return;
    }
    if (req.user!.role === "TEACHER" && grade.subjectAssignment.teacherId !== req.user!.id) {
      res.status(403).json({ message: "You can only delete grades for your own subject assignments" });
      return;
    }
    await prisma.grade.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
