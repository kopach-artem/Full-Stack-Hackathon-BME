import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client";

interface Assignment {
  id: string;
  academicYear: number;
  subject: { id: string; name: string };
  class: { id: string; year: number; name: string };
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Grade {
  id: string;
  value: number;
  type: "REGULAR" | "SEMESTER" | "YEAR_END";
  weight: number;
  description?: string | null;
  studentId: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  REGULAR: "Regular",
  SEMESTER: "Semester",
  YEAR_END: "Year-end",
};

const TYPE_COLORS: Record<string, string> = {
  REGULAR: "bg-gray-100 text-gray-700",
  SEMESTER: "bg-yellow-100 text-yellow-700",
  YEAR_END: "bg-purple-100 text-purple-700",
};

function weightedAverage(grades: Grade[]): string {
  if (grades.length === 0) return "—";
  const totalWeight = grades.reduce((s, g) => s + g.weight, 0);
  const weightedSum = grades.reduce((s, g) => s + g.value * g.weight, 0);
  return (weightedSum / totalWeight).toFixed(2);
}

const emptyGradeForm = { value: 5, type: "REGULAR" as Grade["type"], weight: 1, description: "" };

export function GradeEntryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradesLoading, setGradesLoading] = useState(false);

  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState(emptyGradeForm);
  const [gradeError, setGradeError] = useState("");
  const [gradeSubmitting, setGradeSubmitting] = useState(false);

  useEffect(() => {
    api.get<Assignment[]>("/api/subject-assignments")
      .then(setAssignments)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!assignmentId || assignments.length === 0) return;
    const selected = assignments.find((a) => a.id === assignmentId);
    if (!selected) return;
    setGradesLoading(true);
    Promise.all([
      api.get<{ students: Student[] }>(`/api/classes/${selected.class.id}`),
      api.get<Grade[]>(`/api/grades?subjectAssignmentId=${assignmentId}`),
    ]).then(([cls, g]) => {
      setStudents(cls.students);
      setGrades(g);
    }).finally(() => setGradesLoading(false));
  }, [assignmentId, assignments]);

  const selected = assignments.find((a) => a.id === assignmentId) ?? null;
  const classAvg = weightedAverage(grades);

  async function handleAddGrade(studentId: string, e: React.FormEvent) {
    e.preventDefault();
    setGradeError("");
    setGradeSubmitting(true);
    try {
      const newGrade = await api.post<Grade>("/api/grades", {
        ...gradeForm,
        studentId,
        subjectAssignmentId: assignmentId,
      });
      setGrades((prev) => [newGrade, ...prev]);
      setGradeForm(emptyGradeForm);
    } catch (err: any) {
      setGradeError(err?.message ?? "Failed to add grade");
    } finally {
      setGradeSubmitting(false);
    }
  }

  async function handleDeleteGrade(gradeId: string) {
    if (!confirm("Delete this grade?")) return;
    await api.delete(`/api/grades/${gradeId}`);
    setGrades((prev) => prev.filter((g) => g.id !== gradeId));
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Grade Entry</h1>

      {/* Assignment selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-2">Select subject / class</label>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={assignmentId ?? ""}
          onChange={(e) => {
            setSearchParams(e.target.value ? { assignmentId: e.target.value } : {});
            setExpandedStudentId(null);
            setGradeForm(emptyGradeForm);
            setStudents([]);
            setGrades([]);
          }}
        >
          <option value="">— Choose an assignment —</option>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.subject.name} — {a.class.year}/{a.class.name} ({a.academicYear}/{a.academicYear + 1})
            </option>
          ))}
        </select>
      </div>

      {!selected && (
        <p className="text-gray-400 text-sm">Select an assignment above to enter grades.</p>
      )}

      {selected && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{selected.subject.name}</h2>
              <p className="text-gray-500 text-sm">
                Class {selected.class.year}/{selected.class.name} · {selected.academicYear}/{selected.academicYear + 1}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Class average</p>
              <p className="text-2xl font-bold text-blue-600">{classAvg}</p>
            </div>
          </div>

          {gradesLoading ? (
            <p className="text-gray-400 text-sm">Loading students…</p>
          ) : students.length === 0 ? (
            <p className="text-gray-400 text-sm">No students in this class.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {students.map((student, i) => {
                const studentGrades = grades.filter((g) => g.studentId === student.id);
                const avg = weightedAverage(studentGrades);
                const isOpen = expandedStudentId === student.id;

                return (
                  <div key={student.id} className={i > 0 ? "border-t border-gray-100" : ""}>
                    <div
                      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setExpandedStudentId(isOpen ? null : student.id);
                        setGradeForm(emptyGradeForm);
                        setGradeError("");
                      }}
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 text-sm">{student.name}</span>
                        <span className="text-gray-400 text-xs ml-2">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1 flex-wrap justify-end max-w-40">
                          {studentGrades.slice(0, 6).map((g) => (
                            <span key={g.id} className={`text-xs font-bold px-1.5 py-0.5 rounded ${TYPE_COLORS[g.type]}`}>
                              {g.value}
                            </span>
                          ))}
                          {studentGrades.length > 6 && (
                            <span className="text-xs text-gray-400">+{studentGrades.length - 6}</span>
                          )}
                        </div>
                        <div className="text-right w-12">
                          <p className="text-xs text-gray-400">avg</p>
                          <p className={`font-bold text-sm ${avg !== "—" && Number(avg) < 2.5 ? "text-red-500" : "text-gray-900"}`}>
                            {avg}
                          </p>
                        </div>
                        <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
                        {studentGrades.length === 0 ? (
                          <p className="text-gray-400 text-xs">No grades yet.</p>
                        ) : (
                          <div className="space-y-1">
                            {studentGrades.map((g) => (
                              <div key={g.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200 text-sm">
                                <span className={`font-bold text-base w-5 text-center ${g.value <= 2 ? "text-red-500" : g.value >= 4 ? "text-green-600" : "text-yellow-600"}`}>
                                  {g.value}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[g.type]}`}>
                                  {TYPE_LABELS[g.type]}
                                </span>
                                <span className="text-gray-400 text-xs">×{g.weight}</span>
                                {g.description && <span className="text-gray-600 text-xs flex-1">{g.description}</span>}
                                <span className="text-gray-300 text-xs ml-auto">
                                  {new Date(g.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={() => handleDeleteGrade(g.id)}
                                  className="text-red-400 hover:text-red-600 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <form
                          onSubmit={(e) => handleAddGrade(student.id, e)}
                          className="bg-white border border-gray-200 rounded-lg p-3 space-y-2"
                        >
                          <p className="text-xs font-medium text-gray-600">Add grade</p>
                          <div className="grid grid-cols-4 gap-2">
                            <select
                              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={gradeForm.value}
                              onChange={(e) => setGradeForm((f) => ({ ...f, value: Number(e.target.value) }))}
                            >
                              {[5, 4, 3, 2, 1].map((v) => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                            <select
                              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={gradeForm.type}
                              onChange={(e) => setGradeForm((f) => ({ ...f, type: e.target.value as Grade["type"] }))}
                            >
                              <option value="REGULAR">Regular</option>
                              <option value="SEMESTER">Semester</option>
                              <option value="YEAR_END">Year-end</option>
                            </select>
                            <select
                              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={gradeForm.weight}
                              onChange={(e) => setGradeForm((f) => ({ ...f, weight: Number(e.target.value) }))}
                            >
                              {[1, 2, 3, 4, 5].map((w) => (
                                <option key={w} value={w}>×{w}</option>
                              ))}
                            </select>
                            <input
                              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Note"
                              value={gradeForm.description}
                              onChange={(e) => setGradeForm((f) => ({ ...f, description: e.target.value }))}
                            />
                          </div>
                          {gradeError && <p className="text-red-500 text-xs">{gradeError}</p>}
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={gradeSubmitting}
                              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                              {gradeSubmitting ? "Saving…" : "Add Grade"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
