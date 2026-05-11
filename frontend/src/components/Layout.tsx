import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../context/AuthContext";

const NAV_LINKS: Record<Role, { label: string; to: string }[]> = {
  STUDENT: [
    { label: "My Subjects", to: "/student/subjects" },
    { label: "My Grades", to: "/student/grades" },
  ],
  TEACHER: [
    { label: "My Subjects", to: "/teacher/subjects" },
    { label: "Enter Grades", to: "/teacher/grades" },
  ],
  ADMIN: [
    { label: "Users", to: "/admin/users" },
    { label: "Classes", to: "/admin/classes" },
    { label: "Subjects", to: "/admin/subjects" },
    { label: "Assignments", to: "/admin/assignments" },
  ],
  SUPERADMIN: [
    { label: "Admins", to: "/superadmin/admins" },
    { label: "Users", to: "/admin/users" },
    { label: "Classes", to: "/admin/classes" },
  ],
};

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const links = user ? (NAV_LINKS[user.role] ?? []) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="font-bold text-lg tracking-tight">
            Education Portal
          </Link>
          <div className="flex items-center gap-1 md:gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm px-3 py-1 rounded transition-colors ${
                    isActive ? "bg-green-700 text-white" : "text-green-100 hover:text-white hover:bg-green-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-green-700">
                <span className="text-xs text-green-200 hidden md:block">
                  {user.name}
                  <span className="ml-1 bg-green-700 px-1.5 py-0.5 rounded text-green-100">
                    {user.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-green-700 hover:bg-green-600 px-3 py-1 rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
