import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.js";
import classesRouter from "./routes/classes.js";
import gradesRouter from "./routes/grades.js";
import subjectAssignmentsRouter from "./routes/subjectAssignments.js";
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "education-portal-api", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/subject-assignments", subjectAssignmentsRouter);
app.use("/api/grades", gradesRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => console.log(`API running on http://localhost:${port}`));
