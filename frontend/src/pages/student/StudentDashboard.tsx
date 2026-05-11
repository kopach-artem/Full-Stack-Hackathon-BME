import { useAuth } from "../../context/AuthContext";

export function StudentDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user?.name}</h1>
      <p className="text-gray-500 text-sm mb-6">
        Class:{" "}
        {user?.class ? `${user.class.year}/${user.class.name}` : "Not assigned to a class"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/student/subjects" className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-1">My Subjects</h2>
          <p className="text-gray-500 text-sm">View subjects assigned to your class</p>
        </a>
        <a href="/student/grades" className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-1">My Grades</h2>
          <p className="text-gray-500 text-sm">View your grades and averages</p>
        </a>
      </div>
    </div>
  );
}
