import { useEffect, useState } from "react";
import { api } from "../../api/client";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: { name: string };
}

type RoleTab = "ADMIN" | "SUPERADMIN";

const emptyForm = { name: "", email: "", password: "", role: "ADMIN" as RoleTab };

export function AdminManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [tab, setTab] = useState<RoleTab>("ADMIN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  async function load() {
    try {
      const [admins, superadmins] = await Promise.all([
        api.get<AdminUser[]>("/api/users?role=ADMIN"),
        api.get<AdminUser[]>("/api/users?role=SUPERADMIN"),
      ]);
      const combined = [...admins, ...superadmins];
      setAllUsers(combined);
      setUsers(combined);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const displayed = users.filter((u) => u.role.name === tab);
  const emailTaken = form.email.length > 3 && allUsers.some((u) => u.email === form.email);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (emailTaken) return;
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/api/users", { name: form.name, email: form.email, password: form.password, role: form.role });
      setForm(emptyForm);
      await load();
      setTab(form.role);
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    setEditSubmitting(true);
    try {
      await api.put(`/api/users/${id}`, { name: editName.trim() });
      setEditingId(null);
      await load();
    } catch {
      alert("Failed to update name");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setAllUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Failed to delete user");
    }
  }

  const tabs: { value: RoleTab; label: string }[] = [
    { value: "ADMIN", label: "Admins" },
    { value: "SUPERADMIN", label: "Super Admins" },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Management</h1>

      {/* Create form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Add New User</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as RoleTab }))}
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
          </div>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || emailTaken}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">
              {users.filter((u) => u.role.name === t.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : displayed.length === 0 ? (
        <p className="text-gray-400 text-sm">No {tab === "ADMIN" ? "admins" : "super admins"} yet.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {editingId === u.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(u.id); if (e.key === "Escape") setEditingId(null); }}
                        />
                        <button onClick={() => handleSaveEdit(u.id)} disabled={editSubmitting} className="text-blue-600 text-xs font-medium">
                          {editSubmitting ? "…" : "Save"}
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs">Cancel</button>
                      </div>
                    ) : (
                      u.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {editingId !== u.id && (
                      <button
                        onClick={() => { setEditingId(u.id); setEditName(u.name); }}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium mr-3"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
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
