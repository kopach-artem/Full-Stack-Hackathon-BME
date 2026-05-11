import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const entities = [
  {
    title: "Users",
    text: "Students, teachers, and admins with role-based behavior."
  },
  {
    title: "Courses",
    text: "Course pages, teacher ownership, and student enrollment lists."
  },
  {
    title: "Assignments",
    text: "Tasks, deadlines, submissions, and grading workflows."
  },
  {
    title: "Enrollments",
    text: "The connection between students and the courses they attend."
  }
];

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiUrl}/api/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend did not respond successfully");
        }
        return response.json() as Promise<HealthResponse>;
      })
      .then(setHealth)
      .catch((caughtError: Error) => setError(caughtError.message));
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">BME fullstack hackathon starter</p>
        <h1>Education Portal</h1>
        <p className="intro">
          React, Express, PostgreSQL, and Prisma are wired together so your team can
          spend the competition building features instead of plumbing.
        </p>
      </section>

      <section className="status-panel" aria-live="polite">
        <div>
          <span className={health ? "status-dot online" : "status-dot"} />
          <strong>API status</strong>
        </div>
        {health ? (
          <p>
            Connected to <code>{health.service}</code>
          </p>
        ) : (
          <p>{error ?? "Checking backend connection..."}</p>
        )}
      </section>

      <section className="entity-grid">
        {entities.map((entity) => (
          <article className="entity-card" key={entity.title}>
            <h2>{entity.title}</h2>
            <p>{entity.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
