import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client";

interface Grade {
  id: string;
  value: number;
  type: "REGULAR" | "SEMESTER" | "YEAR_END";
  weight: number;
  description?: string | null;
  createdAt: string;
  subjectAssignment: {
    id: string;
    academicYear: number;
    subject: { name: string };
    class: { year: number; name: string };
  };
}

interface SubjectGroup {
  assignmentId: string;
  subjectName: string;
  academicYear: number;
  classLabel: string;
  grades: Grade[];
}


function weightedAverage(grades: Grade[]): number | null {
  if (grades.length === 0) return null;
  const totalWeight = grades.reduce((s, g) => s + g.weight, 0);
  const weightedSum = grades.reduce((s, g) => s + g.value * g.weight, 0);
  return weightedSum / totalWeight;
}

function avgColor(avg: number): string {
  if (avg >= 4.5) return "text-green-600";
  if (avg >= 3.5) return "text-blue-600";
  if (avg >= 2.5) return "text-yellow-600";
  return "text-red-500";
}

export function MyGradesPage() {
  const [searchParams] = useSearchParams();
  const focusedAssignmentId = searchParams.get("assignmentId");

  const [groups, setGroups] = useState<SubjectGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const focusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api.get<Grade[]>("/api/grades")
      .then((grades) => {
        // Group by subjectAssignment
        const map = new Map<string, SubjectGroup>();
        for (const g of grades) {
          const id = g.subjectAssignment.id;
          if (!map.has(id)) {
            map.set(id, {
              assignmentId: id,
              subjectName: g.subjectAssignment.subject.name,
              academicYear: g.subjectAssignment.academicYear,
              classLabel: `${g.subjectAssignment.class.year}/${g.subjectAssignment.class.name}`,
              grades: [],
            });
          }
          map.get(id)!.grades.push(g);
        }
        setGroups(Array.from(map.values()));
      })
      .catch(() => setError("Failed to load grades"))
      .finally(() => setLoading(false));
  }, []);

  // Scroll to focused subject after render
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [groups, focusedAssignmentId]);

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>;
  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Grades</h1>

      {groups.length === 0 ? (
        <p className="text-gray-400 text-sm">No grades yet.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isFocused = group.assignmentId === focusedAssignmentId;
            const regular = group.grades.filter((g) => g.type === "REGULAR");
            const semester = group.grades.filter((g) => g.type === "SEMESTER");
            const yearEnd = group.grades.filter((g) => g.type === "YEAR_END");
            const avg = weightedAverage(regular); // average only from regular grades

            return (
              <div
                key={group.assignmentId}
                ref={isFocused ? focusRef : null}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  isFocused ? "border-blue-400 shadow-md" : "border-gray-200"
                }`}
              >
                {/* Subject header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-semibold text-gray-900">{group.subjectName}</h2>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {group.classLabel} · {group.academicYear}/{group.academicYear + 1}
                    </p>
                  </div>
                  {avg !== null && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Regular avg</p>
                      <p className={`text-2xl font-bold ${avgColor(avg)}`}>
                        {avg.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Regular grades */}
                  {regular.length > 0 && (
                    <GradeSection title="Regular" grades={regular} />
                  )}

                  {semester.length > 0 && (
                    <GradeSection title="Semester" grades={semester} />
                  )}

                  {yearEnd.length > 0 && (
                    <GradeSection title="Year-end" grades={yearEnd} />
                  )}

                  {group.grades.length === 0 && (
                    <p className="text-gray-400 text-sm">No grades yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GradeSection({ title, grades }: { title: string; grades: Grade[] }) {
  const avg = weightedAverage(grades);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        {avg !== null && (
          <p className="text-xs text-gray-400">avg {avg.toFixed(2)}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {grades.map((g) => (
          <div
            key={g.id}
            className="group relative flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <span className={`font-bold text-base ${g.value <= 2 ? "text-red-500" : g.value >= 4 ? "text-green-600" : "text-yellow-600"}`}>
              {g.value}
            </span>
            {g.weight > 1 && (
              <span className="text-gray-400 text-xs">×{g.weight}</span>
            )}
            {g.description && (
              <span className="text-gray-500 text-xs">{g.description}</span>
            )}
            {/* Tooltip with date */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              {new Date(g.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
