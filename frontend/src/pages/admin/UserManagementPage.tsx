import { useEffect, useState } from "react";
import { api } from "../../api/client";

interface UserRow {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: { name: string };
  class?: { id: string; year: number; name: string } | null;
}

interface ClassOption {
  id: string;
  year: number;
  name: string;
}

type RoleFilter = "ALL" | "TEACHER" | "STUDENT";

const emptyForm = { name: "", email: "", password: "", role: "STUDENT" as "TEACHER" | "STUDENT", classId: "" };

export function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [filter, setFilter] = useState<RoleFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingClass, setEditingClass] = useState<{ userId: string; classId: string } | null>(null);

  async function loadUsers() {
    const data = await api.get<UserRow[]>("/api/users");
    setUsers(data.filter((u) => u.role.name === "TEACHER" || u.role.name === "STUDENT"));
  }

  useEffect(() => {
    Promise.all([
      loadUsers(),
      api.get<ClassOption[]>("/api/classes").then(setClasses),
    ]).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? users : users.filter((u) => u.role.name === filter);
  const emailTaken = form.email.length > 3 && users.some((u) => u.email === form.email);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (form.role === "STUDENT" && !form.classId) {
      setFormError("Students must be assigned to a class");
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === "STUDENT" && form.classId) payload.classId = form.classId;
      await api.post("/api/users", payload);
      setForm(emptyForm);
      await loadUsers();
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete user "${name}"?`)) return;
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Failed to delete user");
    }
  }

  async function handleClassChange(userId: string, classId: string) {
    try {
      await api.put(`/api/users/${userId}`, { classId: classId || null });
      setEditingClass(null);
      await loadUsers();
    } catch {
      alert("Failed to update class");
    }
  }

  const tabs: RoleFilter[] = ["ALL", "TEACHER", "STUDENT"];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      {/* Create form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Add New User</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="flex flex-col gap-1">
            <input
              type="email"
              className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${emailTaken ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            {emailTaken && <p className="text-red-500 text-xs">This email is already in use</p>}
          </div>
          <input
            type="password"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password (min 6)"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            minLength={6}
            required
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "TEACHER" | "STUDENT", classId: "" }))}
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
          </select>
          {form.role === "STUDENT" && (
            <select
              className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2 ${!form.classId ? "border-orange-300" : "border-gray-300"}`}
              value={form.classId}
              onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
              required
            >
              <option value="">— Select class (required) —</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.year}/{c.name}</option>
              ))}
            </select>
          )}
          {formError && <p className="sm:col-span-2 text-red-500 text-sm">{formError}</p>}
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || emailTaken || (form.role === "STUDENT" && !form.classId)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === t
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "ALL" ? "All" : t === "TEACHER" ? "Teachers" : "Students"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No users found.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role.name === "TEACHER"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {user.role.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {user.role.name === "STUDENT" ? (
                      editingClass?.userId === user.id ? (
                        <select
                          autoFocus
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                          defaultValue={user.class?.id ?? ""}
                          onBlur={(e) => handleClassChange(user.id, e.target.value)}
                          onChange={(e) => handleClassChange(user.id, e.target.value)}
                        >
                          <option value="">No class</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.year}/{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingClass({ userId: user.id, classId: user.class?.id ?? "" })}
                          className="hover:underline text-left"
                        >
                          {user.class ? `${user.class.year}/${user.class.name}` : <span className="text-gray-300">—</span>}
                        </button>
                      )
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
