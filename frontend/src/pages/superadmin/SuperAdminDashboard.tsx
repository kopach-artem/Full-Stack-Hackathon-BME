import { useAuth } from "../../context/AuthContext";

export function SuperAdminDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Super Admin Panel</h1>
      <p className="text-gray-500 text-sm mb-6">Logged in as {user?.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/superadmin/admins" className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-1">Manage Admins</h2>
          <p className="text-gray-500 text-sm">Create and manage administrator accounts</p>
        </a>
        <a href="/admin/users" className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-1">All Users</h2>
          <p className="text-gray-500 text-sm">View and manage all system users</p>
        </a>
      </div>
    </div>
  );
}
