import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Roles
  const roles = await Promise.all(
    (["SUPERADMIN", "ADMIN", "TEACHER", "STUDENT"] as RoleName[]).map((name) =>
      prisma.role.upsert({ where: { name }, update: {}, create: { name } })
    )
  );
  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r]));

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // Super admin
  await prisma.user.upsert({
    where: { email: "superadmin@school.edu" },
    update: {},
    create: {
      email: "superadmin@school.edu",
      name: "Super Admin",
      passwordHash: await hash("superadmin123"),
      roleId: roleMap["SUPERADMIN"].id,
    },
  });

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@school.edu" },
    update: {},
    create: {
      email: "admin@school.edu",
      name: "School Admin",
      passwordHash: await hash("admin123"),
      roleId: roleMap["ADMIN"].id,
    },
  });

  // Teachers
  const teacher1 = await prisma.user.upsert({
    where: { email: "kovacs.peter@school.edu" },
    update: {},
    create: {
      email: "kovacs.peter@school.edu",
      name: "Kovács Péter",
      passwordHash: await hash("teacher123"),
      roleId: roleMap["TEACHER"].id,
    },
  });
  const teacher2 = await prisma.user.upsert({
    where: { email: "nagy.anna@school.edu" },
    update: {},
    create: {
      email: "nagy.anna@school.edu",
      name: "Nagy Anna",
      passwordHash: await hash("teacher123"),
      roleId: roleMap["TEACHER"].id,
    },
  });

  // Classes
  const classA = await prisma.class.upsert({
    where: { year_name: { year: 2024, name: "A" } },
    update: {},
    create: { year: 2024, name: "A" },
  });
  const classB = await prisma.class.upsert({
    where: { year_name: { year: 2024, name: "B" } },
    update: {},
    create: { year: 2024, name: "B" },
  });

  // Students
  const student1 = await prisma.user.upsert({
    where: { email: "toth.bela@school.edu" },
    update: {},
    create: {
      email: "toth.bela@school.edu",
      name: "Tóth Béla",
      passwordHash: await hash("student123"),
      roleId: roleMap["STUDENT"].id,
      classId: classA.id,
    },
  });
  const student2 = await prisma.user.upsert({
    where: { email: "kiss.eva@school.edu" },
    update: {},
    create: {
      email: "kiss.eva@school.edu",
      name: "Kiss Éva",
      passwordHash: await hash("student123"),
      roleId: roleMap["STUDENT"].id,
      classId: classA.id,
    },
  });
  const student3 = await prisma.user.upsert({
    where: { email: "molnar.adam@school.edu" },
    update: {},
    create: {
      email: "molnar.adam@school.edu",
      name: "Molnár Ádám",
      passwordHash: await hash("student123"),
      roleId: roleMap["STUDENT"].id,
      classId: classB.id,
    },
  });

  // Subjects
  const math = await prisma.subject.upsert({
    where: { id: "math" },
    update: {},
    create: {
      id: "math",
      name: "Mathematics",
      description: "Algebra, geometry, and calculus fundamentals",
      bookRequired: "Matematika 10. osztály",
    },
  });
  const hungarian = await prisma.subject.upsert({
    where: { id: "hungarian" },
    update: {},
    create: {
      id: "hungarian",
      name: "Hungarian Language and Literature",
      description: "Grammar, literature, and essay writing",
      bookRequired: "Magyar irodalom 10.",
    },
  });
  const history = await prisma.subject.upsert({
    where: { id: "history" },
    update: {},
    create: {
      id: "history",
      name: "History",
      description: "World and Hungarian history",
      bookRequired: "Történelem 10.",
    },
  });
  const physics = await prisma.subject.upsert({
    where: { id: "physics" },
    update: {},
    create: {
      id: "physics",
      name: "Physics",
      description: "Mechanics, thermodynamics, and electromagnetism",
      bookRequired: "Fizika 10. osztály",
    },
  });

  // Subject assignments (2024/2025 academic year)
  const mathAssignmentA = await prisma.subjectAssignment.upsert({
    where: { subjectId_classId_academicYear: { subjectId: math.id, classId: classA.id, academicYear: 2024 } },
    update: {},
    create: { subjectId: math.id, classId: classA.id, teacherId: teacher1.id, academicYear: 2024 },
  });
  await prisma.subjectAssignment.upsert({
    where: { subjectId_classId_academicYear: { subjectId: hungarian.id, classId: classA.id, academicYear: 2024 } },
    update: {},
    create: { subjectId: hungarian.id, classId: classA.id, teacherId: teacher2.id, academicYear: 2024 },
  });
  await prisma.subjectAssignment.upsert({
    where: { subjectId_classId_academicYear: { subjectId: history.id, classId: classA.id, academicYear: 2024 } },
    update: {},
    create: { subjectId: history.id, classId: classA.id, teacherId: teacher2.id, academicYear: 2024 },
  });
  await prisma.subjectAssignment.upsert({
    where: { subjectId_classId_academicYear: { subjectId: math.id, classId: classB.id, academicYear: 2024 } },
    update: {},
    create: { subjectId: math.id, classId: classB.id, teacherId: teacher1.id, academicYear: 2024 },
  });
  await prisma.subjectAssignment.upsert({
    where: { subjectId_classId_academicYear: { subjectId: physics.id, classId: classB.id, academicYear: 2024 } },
    update: {},
    create: { subjectId: physics.id, classId: classB.id, teacherId: teacher1.id, academicYear: 2024 },
  });

  // Sample grades for student1 in math
  const existingGrades = await prisma.grade.count({
    where: { studentId: student1.id, subjectAssignmentId: mathAssignmentA.id },
  });
  if (existingGrades === 0) {
    await prisma.grade.createMany({
      data: [
        { value: 5, type: "REGULAR", weight: 1, description: "Quiz 1", studentId: student1.id, subjectAssignmentId: mathAssignmentA.id },
        { value: 4, type: "REGULAR", weight: 1, description: "Quiz 2", studentId: student1.id, subjectAssignmentId: mathAssignmentA.id },
        { value: 3, type: "REGULAR", weight: 3, description: "Midterm", studentId: student1.id, subjectAssignmentId: mathAssignmentA.id },
        { value: 5, type: "REGULAR", weight: 1, description: "Quiz 3", studentId: student2.id, subjectAssignmentId: mathAssignmentA.id },
        { value: 4, type: "REGULAR", weight: 3, description: "Midterm", studentId: student2.id, subjectAssignmentId: mathAssignmentA.id },
      ],
    });
  }

  console.log("Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  superadmin@school.edu / superadmin123");
  console.log("  admin@school.edu      / admin123");
  console.log("  kovacs.peter@school.edu / teacher123");
  console.log("  nagy.anna@school.edu    / teacher123");
  console.log("  toth.bela@school.edu    / student123  (class 2024/A)");
  console.log("  kiss.eva@school.edu     / student123  (class 2024/A)");
  console.log("  molnar.adam@school.edu  / student123  (class 2024/B)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
