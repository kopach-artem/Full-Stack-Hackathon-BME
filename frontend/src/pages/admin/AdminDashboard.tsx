import { useAuth } from "../../context/AuthContext";

export function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Panel</h1>
      <p className="text-gray-500 text-sm mb-6">Logged in as {user?.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Users", desc: "Manage students and teachers", to: "/admin/users" },
          { label: "Classes", desc: "Manage school classes", to: "/admin/classes" },
          { label: "Subjects", desc: "Manage subject catalog", to: "/admin/subjects" },
          { label: "Assignments", desc: "Assign subjects to classes", to: "/admin/assignments" },
        ].map((item) => (
          <a
            key={item.to}
            href={item.to}
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="font-semibold text-gray-900 mb-1">{item.label}</h2>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
