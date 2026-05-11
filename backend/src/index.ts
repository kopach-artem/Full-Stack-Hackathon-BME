import "dotenv/config";

import cors from "cors";
import express from "express";
import { prisma } from "./prisma.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "education-portal-api",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/roles", async (_request, response, next) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
    response.json(roles);
  } catch (error) {
    next(error);
  }
});

app.get("/api/users", async (_request, response, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" }
    });
    response.json(users);
  } catch (error) {
    next(error);
  }
});

app.get("/api/courses", async (_request, response, next) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacher: true,
        assignments: true,
        enrollments: true
      },
      orderBy: { createdAt: "desc" }
    });
    response.json(courses);
  } catch (error) {
    next(error);
  }
});

app.post("/api/courses", async (request, response, next) => {
  try {
    const { title, description, teacherId } = request.body;

    if (!title || !teacherId) {
      response.status(400).json({ message: "title and teacherId are required" });
      return;
    }

    const course = await prisma.course.create({
      data: { title, description, teacherId }
    });

    response.status(201).json(course);
  } catch (error) {
    next(error);
  }
});

app.get("/api/assignments", async (_request, response, next) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: { course: true },
      orderBy: { createdAt: "desc" }
    });
    response.json(assignments);
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(error);
    response.status(500).json({ message: "Something went wrong" });
  }
);

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
