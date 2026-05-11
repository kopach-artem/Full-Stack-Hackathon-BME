import { useAuth } from "../../context/AuthContext";

export function TeacherDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user?.name}</h1>
      <p className="text-gray-500 text-sm mb-6">Teacher dashboard</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/teacher/subjects" className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-1">My Subjects</h2>
          <p className="text-gray-500 text-sm">View your assigned subjects and classes</p>
        </a>
        <a href="/teacher/grades" className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <h2 className="font-semibold text-gray-900 mb-1">Enter Grades</h2>
          <p className="text-gray-500 text-sm">Record grades for your students</p>
        </a>
      </div>
    </div>
  );
}
