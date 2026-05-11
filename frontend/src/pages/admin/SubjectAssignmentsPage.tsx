import { useEffect, useState } from "react";
import { api } from "../../api/client";

interface Assignment {
  id: string;
  academicYear: number;
  subject: { id: string; name: string };
  class: { id: string; year: number; name: string };
  teacher: { id: string; name: string; email: string };
  _count: { grades: number };
}

interface Subject { id: string; name: string }
interface ClassOption { id: string; year: number; name: string }
interface Teacher { id: string; name: string; email: string }

const currentYear = new Date().getFullYear();
const emptyForm = { subjectId: "", classId: "", teacherId: "", academicYear: currentYear };

export function SubjectAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ teacherId: string; academicYear: number }>({ teacherId: "", academicYear: currentYear });
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  async function loadAssignments() {
    const data = await api.get<Assignment[]>("/api/subject-assignments");
    setAssignments(data);
  }

  useEffect(() => {
    Promise.all([
      loadAssignments(),
      api.get<Subject[]>("/api/subjects").then(setSubjects),
      api.get<ClassOption[]>("/api/classes").then(setClasses),
      api.get<any[]>("/api/users?role=TEACHER").then(setTeachers),
    ]).finally(() => setLoading(false));
  }, []);

  const duplicate = form.subjectId && form.classId &&
    assignments.some((a) =>
      a.subject.id === form.subjectId &&
      a.class.id === form.classId &&
      a.academicYear === form.academicYear
    );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (duplicate) { setFormError("This subject is already assigned to this class for that year"); return; }
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/api/subject-assignments", {
        subjectId: form.subjectId,
        classId: form.classId,
        teacherId: form.teacherId,
        academicYear: form.academicYear,
      });
      setForm(emptyForm);
      await loadAssignments();
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(a: Assignment) {
    setEditingId(a.id);
    setEditForm({ teacherId: a.teacher.id, academicYear: a.academicYear });
    setEditError("");
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setEditSubmitting(true);
    try {
      await api.put(`/api/subject-assignments/${editingId}`, editForm);
      setEditingId(null);
      await loadAssignments();
    } catch (err: any) {
      setEditError(err?.message ?? "Failed to update assignment");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id: string, label: string, gradesCount: number) {
    if (gradesCount > 0) {
      alert(`Cannot delete "${label}" — it has ${gradesCount} grade(s). Delete grades first.`);
      return;
    }
    if (!confirm(`Delete assignment "${label}"?`)) return;
    try {
      await api.delete(`/api/subject-assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete assignment");
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subject Assignments</h1>

      {/* Create form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">New Assignment</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.subjectId}
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              required
            >
              <option value="">Subject *</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.classId}
              onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
              required
            >
              <option value="">Class *</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.year}/{c.name}</option>)}
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.teacherId}
              onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
              required
            >
              <option value="">Teacher *</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input
              type="number"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Academic year"
              value={form.academicYear}
              min={2000}
              max={2100}
              onChange={(e) => setForm((f) => ({ ...f, academicYear: Number(e.target.value) }))}
              required
            />
          </div>
          {(formError || duplicate) && (
            <p className="text-red-500 text-sm">{formError || "This subject is already assigned to this class for that year"}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !!duplicate}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : assignments.length === 0 ? (
        <p className="text-gray-400 text-sm">No assignments yet.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Teacher</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Year</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map((a) => {
                const label = `${a.subject.name} → ${a.class.year}/${a.class.name}`;
                return (
                  <tr key={a.id}>
                    {editingId === a.id ? (
                      <td colSpan={5} className="px-4 py-3 bg-blue-50">
                        <form onSubmit={handleEdit} className="flex gap-2 items-center flex-wrap">
                          <span className="font-medium text-gray-700 text-sm">{a.subject.name} → {a.class.year}/{a.class.name}</span>
                          <select
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editForm.teacherId}
                            onChange={(e) => setEditForm((f) => ({ ...f, teacherId: e.target.value }))}
                            required
                          >
                            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <input
                            type="number"
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editForm.academicYear}
                            min={2000}
                            max={2100}
                            onChange={(e) => setEditForm((f) => ({ ...f, academicYear: Number(e.target.value) }))}
                            required
                          />
                          {editError && <p className="text-red-500 text-xs w-full">{editError}</p>}
                          <div className="flex gap-2 ml-auto">
                            <button type="button" onClick={() => setEditingId(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                            <button type="submit" disabled={editSubmitting} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                              {editSubmitting ? "Saving…" : "Save"}
                            </button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-gray-900">{a.subject.name}</td>
                        <td className="px-4 py-3 text-gray-600">{a.class.year}/{a.class.name}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <div>{a.teacher.name}</div>
                          <div className="text-gray-400 text-xs">{a.teacher.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{a.academicYear}/{a.academicYear + 1}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button onClick={() => startEdit(a)} className="text-blue-500 hover:text-blue-700 text-xs font-medium mr-3">Edit</button>
                          <button onClick={() => handleDelete(a.id, label, a._count.grades)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
