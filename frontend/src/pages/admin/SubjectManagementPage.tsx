import { useEffect, useState } from "react";
import { api } from "../../api/client";

interface Subject {
  id: string;
  name: string;
  description?: string | null;
  bookRequired?: string | null;
  _count: { assignments: number };
}

interface Assignment {
  id: string;
  academicYear: number;
  class: { id: string; year: number; name: string };
  teacher: { id: string; name: string; email: string };
  _count: { grades: number };
}

interface ClassOption { id: string; year: number; name: string }
interface Teacher { id: string; name: string; email: string }

const currentYear = new Date().getFullYear();
const emptySubjectForm = { name: "", description: "", bookRequired: "" };
const emptyAssignForm = { classId: "", teacherId: "", academicYear: currentYear };

export function SubjectManagementPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // subject create/edit
  const [form, setForm] = useState(emptySubjectForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptySubjectForm);
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // expand + assignment management
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subjectAssignments, setSubjectAssignments] = useState<Record<string, Assignment[]>>({});
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignForm, setAssignForm] = useState(emptyAssignForm);
  const [assignError, setAssignError] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [editingAssignId, setEditingAssignId] = useState<string | null>(null);
  const [editAssignForm, setEditAssignForm] = useState({ teacherId: "", academicYear: currentYear });
  const [editAssignError, setEditAssignError] = useState("");
  const [editAssignSubmitting, setEditAssignSubmitting] = useState(false);

  async function loadSubjects() {
    const data = await api.get<Subject[]>("/api/subjects");
    setSubjects(data);
  }

  useEffect(() => {
    Promise.all([
      loadSubjects(),
      api.get<ClassOption[]>("/api/classes").then(setClasses),
      api.get<Teacher[]>("/api/users?role=TEACHER").then(setTeachers),
    ]).finally(() => setLoading(false));
  }, []);

  async function loadAssignments(subjectId: string) {
    setAssignLoading(true);
    try {
      const data = await api.get<Assignment[]>(`/api/subject-assignments?subjectId=${subjectId}`);
      setSubjectAssignments((prev) => ({ ...prev, [subjectId]: data }));
    } finally {
      setAssignLoading(false);
    }
  }

  async function toggleExpand(subjectId: string) {
    if (expandedId === subjectId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(subjectId);
    setAssignForm(emptyAssignForm);
    setAssignError("");
    setEditingAssignId(null);
    await loadAssignments(subjectId);
  }

  // --- Subject CRUD ---
  const nameTaken = (name: string, excludeId?: string) =>
    subjects.some((s) => s.name.toLowerCase() === name.trim().toLowerCase() && s.id !== excludeId);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (nameTaken(form.name)) { setFormError("A subject with this name already exists"); return; }
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/api/subjects", {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        bookRequired: form.bookRequired.trim() || undefined,
      });
      setForm(emptySubjectForm);
      await loadSubjects();
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to create subject");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubject(e: React.FormEvent) {
    e.preventDefault();
    if (nameTaken(editForm.name, editingSubjectId!)) { setEditError("A subject with this name already exists"); return; }
    setEditError("");
    setEditSubmitting(true);
    try {
      await api.put(`/api/subjects/${editingSubjectId}`, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        bookRequired: editForm.bookRequired.trim() || undefined,
      });
      setEditingSubjectId(null);
      await loadSubjects();
    } catch (err: any) {
      setEditError(err?.message ?? "Failed to update subject");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDeleteSubject(id: string, name: string, count: number) {
    if (count > 0) {
      alert(`Cannot delete "${name}" — it is assigned to ${count} class(es). Remove assignments first.`);
      return;
    }
    if (!confirm(`Delete subject "${name}"?`)) return;
    await api.delete(`/api/subjects/${id}`);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  // --- Assignment CRUD ---
  function assignDuplicate(subjectId: string) {
    if (!assignForm.classId || !assignForm.academicYear) return false;
    return (subjectAssignments[subjectId] ?? []).some(
      (a) => a.class.id === assignForm.classId && a.academicYear === assignForm.academicYear
    );
  }

  function editAssignDuplicate(subjectId: string, excludeId: string) {
    if (!editAssignForm.academicYear) return false;
    return (subjectAssignments[subjectId] ?? []).some(
      (a) => a.id !== excludeId && a.academicYear === editAssignForm.academicYear
    );
  }

  async function handleAddAssignment(subjectId: string, e: React.FormEvent) {
    e.preventDefault();
    if (assignDuplicate(subjectId)) {
      setAssignError("This class already has this subject assigned for that academic year");
      return;
    }
    setAssignError("");
    setAssignSubmitting(true);
    try {
      await api.post("/api/subject-assignments", {
        subjectId,
        classId: assignForm.classId,
        teacherId: assignForm.teacherId,
        academicYear: assignForm.academicYear,
      });
      setAssignForm(emptyAssignForm);
      await loadAssignments(subjectId);
      await loadSubjects();
    } catch (err: any) {
      setAssignError(err?.message ?? "Failed to add assignment");
    } finally {
      setAssignSubmitting(false);
    }
  }

  async function handleEditAssignment(subjectId: string, e: React.FormEvent) {
    e.preventDefault();
    setEditAssignError("");
    setEditAssignSubmitting(true);
    try {
      await api.put(`/api/subject-assignments/${editingAssignId}`, editAssignForm);
      setEditingAssignId(null);
      await loadAssignments(subjectId);
    } catch (err: any) {
      setEditAssignError(err?.message ?? "Failed to update assignment");
    } finally {
      setEditAssignSubmitting(false);
    }
  }

  async function handleDeleteAssignment(subjectId: string, assignId: string, label: string, gradesCount: number) {
    if (gradesCount > 0) {
      alert(`Cannot delete "${label}" — it has ${gradesCount} grade(s).`);
      return;
    }
    if (!confirm(`Remove assignment "${label}"?`)) return;
    await api.delete(`/api/subject-assignments/${assignId}`);
    await loadAssignments(subjectId);
    await loadSubjects();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subject Management</h1>

      {/* Create subject form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Add New Subject</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Required book"
              value={form.bookRequired}
              onChange={(e) => setForm((f) => ({ ...f, bookRequired: e.target.value }))}
            />
          </div>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={submitting}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? "Creating…" : "Create Subject"}
            </button>
          </div>
        </form>
      </div>

      {/* Subject list */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : subjects.length === 0 ? (
        <p className="text-gray-400 text-sm">No subjects yet.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {subjects.map((s, i) => {
            const isOpen = expandedId === s.id;
            const assignments = subjectAssignments[s.id] ?? [];

            return (
              <div key={s.id} className={i > 0 ? "border-t border-gray-100" : ""}>
                {/* Subject row — edit mode */}
                {editingSubjectId === s.id ? (
                  <form onSubmit={handleEditSubject} className="px-4 py-3 space-y-2 bg-blue-50">
                    <div className="grid grid-cols-3 gap-2">
                      <input className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} required />
                      <input className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                      <input className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Required book" value={editForm.bookRequired} onChange={(e) => setEditForm((f) => ({ ...f, bookRequired: e.target.value }))} />
                    </div>
                    {editError && <p className="text-red-500 text-xs">{editError}</p>}
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditingSubjectId(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                      <button type="submit" disabled={editSubmitting}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        {editSubmitting ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Subject row — display mode */
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => toggleExpand(s.id)}
                    >
                      <p className="font-medium text-gray-900 text-sm">{s.name}</p>
                      {s.description && <p className="text-gray-400 text-xs truncate">{s.description}</p>}
                      {s.bookRequired && <p className="text-gray-400 text-xs">Book: {s.bookRequired}</p>}
                    </div>
                    <span className="text-gray-400 text-xs whitespace-nowrap cursor-pointer" onClick={() => toggleExpand(s.id)}>
                      {s._count.assignments} class{s._count.assignments !== 1 ? "es" : ""} {isOpen ? "▲" : "▼"}
                    </span>
                    <button onClick={() => { setEditingSubjectId(s.id); setExpandedId(null); setEditForm({ name: s.name, description: s.description ?? "", bookRequired: s.bookRequired ?? "" }); setEditError(""); }}
                      className="text-blue-500 hover:text-blue-700 text-xs font-medium">Edit</button>
                    <button onClick={() => handleDeleteSubject(s.id, s.name, s._count.assignments)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                  </div>
                )}

                {/* Expanded assignments panel */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
                    {assignLoading ? (
                      <p className="text-gray-400 text-sm">Loading…</p>
                    ) : assignments.length === 0 ? (
                      <p className="text-gray-400 text-sm">Not assigned to any class yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {assignments.map((a) => {
                          const label = `${a.class.year}/${a.class.name}`;
                          return (
                            <div key={a.id} className="bg-white border border-gray-200 rounded-lg">
                              {editingAssignId === a.id ? (
                                <form onSubmit={(e) => handleEditAssignment(s.id, e)} className="flex gap-2 items-center flex-wrap p-3">
                                  <select
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editAssignForm.teacherId}
                                    onChange={(e) => setEditAssignForm((f) => ({ ...f, teacherId: e.target.value }))}
                                    required
                                  >
                                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                  </select>
                                  <div className="flex flex-col gap-1">
                                    <input type="number" min={2000} max={2100}
                                      className={`border rounded-lg px-2 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 ${editAssignDuplicate(s.id, a.id) ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
                                      value={editAssignForm.academicYear}
                                      onChange={(e) => setEditAssignForm((f) => ({ ...f, academicYear: Number(e.target.value) }))}
                                      required
                                    />
                                    {editAssignDuplicate(s.id, a.id) && <p className="text-red-500 text-xs">Year conflict</p>}
                                  </div>
                                  {editAssignError && <p className="text-red-500 text-xs w-full">{editAssignError}</p>}
                                  <div className="flex gap-2 ml-auto">
                                    <button type="button" onClick={() => setEditingAssignId(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                                    <button type="submit" disabled={editAssignSubmitting || editAssignDuplicate(s.id, a.id)}
                                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                                      {editAssignSubmitting ? "Saving…" : "Save"}
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex items-center gap-3 px-3 py-2 text-sm">
                                  <span className="font-medium text-gray-800 w-16">{label}</span>
                                  <span className="text-gray-500 flex-1">{a.teacher.name}</span>
                                  <span className="text-gray-400 text-xs">{a.teacher.email}</span>
                                  <span className="text-gray-400 text-xs whitespace-nowrap">{a.academicYear}/{a.academicYear + 1}</span>
                                  <button
                                    onClick={() => { setEditingAssignId(a.id); setEditAssignForm({ teacherId: a.teacher.id, academicYear: a.academicYear }); setEditAssignError(""); }}
                                    className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                                  >Edit</button>
                                  <button
                                    onClick={() => handleDeleteAssignment(s.id, a.id, `${s.name} → ${label}`, a._count.grades)}
                                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                                  >Remove</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add assignment form */}
                    <form onSubmit={(e) => handleAddAssignment(s.id, e)} className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-gray-600">Assign to a class</p>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={assignForm.classId}
                          onChange={(e) => setAssignForm((f) => ({ ...f, classId: e.target.value }))}
                          required
                        >
                          <option value="">Class *</option>
                          {classes.map((c) => <option key={c.id} value={c.id}>{c.year}/{c.name}</option>)}
                        </select>
                        <select
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={assignForm.teacherId}
                          onChange={(e) => setAssignForm((f) => ({ ...f, teacherId: e.target.value }))}
                          required
                        >
                          <option value="">Teacher *</option>
                          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <input type="number" min={2000} max={2100}
                          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={assignForm.academicYear}
                          onChange={(e) => setAssignForm((f) => ({ ...f, academicYear: Number(e.target.value) }))}
                          required
                        />
                      </div>
                      {(assignError || assignDuplicate(s.id)) && (
                        <p className="text-red-500 text-xs">{assignError || "This class already has this subject for that academic year"}</p>
                      )}
                      <div className="flex justify-end">
                        <button type="submit" disabled={assignSubmitting || assignDuplicate(s.id)}
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                          {assignSubmitting ? "Assigning…" : "Assign"}
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
    </div>
  );
}
