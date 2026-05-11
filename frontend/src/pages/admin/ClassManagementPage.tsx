import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface ClassRow {
  id: string;
  year: number;
  name: string;
  _count: { students: number; assignments: number };
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface ClassDetail {
  id: string;
  students: Student[];
}

const currentYear = new Date().getFullYear();
const emptyClassForm = { year: currentYear, name: "" };
const emptyAddForm = { name: "", email: "", password: "" };

export function ClassManagementPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPERADMIN";

  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyClassForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [allUsers, setAllUsers] = useState<{ email: string }[]>([]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ClassDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [addForm, setAddForm] = useState(emptyAddForm);
  const [addError, setAddError] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);

  async function load() {
    try {
      const data = await api.get<ClassRow[]>("/api/classes");
      setClasses(data);
    } catch {
      setFormError("Failed to load classes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    api.get<{ email: string }[]>("/api/users").then(setAllUsers).catch(() => {});
  }, []);

  async function loadDetail(classId: string) {
    setDetailLoading(true);
    try {
      const det = await api.get<ClassDetail>(`/api/classes/${classId}`);
      setDetail(det);
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggleExpand(cls: ClassRow) {
    if (expandedId === cls.id) {
      setExpandedId(null);
      setDetail(null);
      setAddForm(emptyAddForm);
      setAddError("");
      return;
    }
    setExpandedId(cls.id);
    setDetail(null);
    setAddForm(emptyAddForm);
    setAddError("");
    await loadDetail(cls.id);
  }

  async function handleRemoveStudent(classId: string, studentId: string) {
    if (!confirm("Remove this student from the class?")) return;
    await api.put(`/api/users/${studentId}`, { classId: null });
    setClasses((prev) => prev.map((c) =>
      c.id === classId ? { ...c, _count: { ...c._count, students: c._count.students - 1 } } : c
    ));
    await loadDetail(classId);
  }

  async function handleAddStudent(classId: string, e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddSubmitting(true);
    try {
      await api.post("/api/users", { ...addForm, role: "STUDENT", classId });
      setAddForm(emptyAddForm);
      setClasses((prev) => prev.map((c) =>
        c.id === classId ? { ...c, _count: { ...c._count, students: c._count.students + 1 } } : c
      ));
      await loadDetail(classId);
    } catch (err: any) {
      setAddError(err?.message ?? "Failed to create student");
    } finally {
      setAddSubmitting(false);
    }
  }

  const addEmailTaken = addForm.email.length > 3 && allUsers.some((u) => u.email === addForm.email);

  const duplicate = form.name.trim().length > 0 &&
    classes.some((c) => c.year === form.year && c.name.toLowerCase() === form.name.trim().toLowerCase());

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (duplicate) return;
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/api/classes", { year: form.year, name: form.name.trim() });
      setForm(emptyClassForm);
      await load();
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to create class");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, label: string, studentCount: number) {
    if (studentCount > 0) {
      alert(`Cannot delete class "${label}" — it still has ${studentCount} student(s). Reassign them first.`);
      return;
    }
    if (!confirm(`Delete class "${label}"?`)) return;
    try {
      await api.delete(`/api/classes/${id}`);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      if (expandedId === id) { setExpandedId(null); setDetail(null); }
    } catch {
      alert("Failed to delete class");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Class Management</h1>

      {/* Create class form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Add New Class</h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-start flex-wrap">
          <div className="flex flex-col gap-1">
            <input
              type="number"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Year"
              value={form.year}
              min={2000}
              max={2100}
              onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <input
              className={`border rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 ${duplicate ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
              placeholder="Name (e.g. A)"
              value={form.name}
              maxLength={5}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            {duplicate && <p className="text-red-500 text-xs">Already exists</p>}
          </div>
          {formError && <p className="text-red-500 text-sm w-full">{formError}</p>}
          <button
            type="submit"
            disabled={submitting || duplicate}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Class"}
          </button>
        </form>
      </div>

      {/* Class list */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : classes.length === 0 ? (
        <p className="text-gray-400 text-sm">No classes yet.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {classes.map((cls, i) => {
            const label = `${cls.year}/${cls.name}`;
            const isOpen = expandedId === cls.id;
            return (
              <div key={cls.id} className={i > 0 ? "border-t border-gray-100" : ""}>
                {/* Row */}
                <div
                  className="flex items-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleExpand(cls)}
                >
                  <div className="flex-1 flex items-center gap-6 px-4 py-3">
                    <span className="font-medium text-gray-900 w-20">{label}</span>
                    <span className="text-gray-500 text-sm">{cls._count.students} students</span>
                    <span className="text-gray-500 text-sm">{cls._count.assignments} subjects</span>
                  </div>
                  <div className="flex items-center gap-3 px-4">
                    <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(cls.id, label, cls._count.students); }}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
                    {/* Student list */}
                    {detailLoading ? (
                      <p className="text-gray-400 text-sm">Loading…</p>
                    ) : !detail || detail.students.length === 0 ? (
                      <p className="text-gray-400 text-sm">No students in this class yet.</p>
                    ) : (
                      <ul className="divide-y divide-gray-200 rounded-lg overflow-hidden bg-white border border-gray-200">
                        {detail.students.map((s) => (
                          <li key={s.id} className="flex items-center justify-between px-4 py-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">{s.name}</span>
                              <span className="text-gray-400 ml-2">{s.email}</span>
                            </div>
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleRemoveStudent(cls.id, s.id)}
                                className="text-red-400 hover:text-red-600 text-xs font-medium ml-4"
                              >
                                Remove
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Add student inline form (superadmin only) */}
                    {isSuperAdmin && (
                      <form
                        onSubmit={(e) => handleAddStudent(cls.id, e)}
                        className="bg-white border border-gray-200 rounded-lg p-3 space-y-2"
                      >
                        <p className="text-xs font-medium text-gray-600">Add new student to this class</p>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Full name"
                            value={addForm.name}
                            onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                            required
                          />
                          <div className="flex flex-col gap-1">
                            <input
                              type="email"
                              className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 ${addEmailTaken ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
                              placeholder="Email"
                              value={addForm.email}
                              onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                              required
                            />
                            {addEmailTaken && <p className="text-red-500 text-xs">Already in use</p>}
                          </div>
                          <input
                            type="password"
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Password (min 6)"
                            value={addForm.password}
                            minLength={6}
                            onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                            required
                          />
                        </div>
                        {addError && <p className="text-red-500 text-xs">{addError}</p>}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={addSubmitting || addEmailTaken}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                          >
                            {addSubmitting ? "Adding…" : "Add Student"}
                          </button>
                        </div>
                      </form>
                    )}
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
