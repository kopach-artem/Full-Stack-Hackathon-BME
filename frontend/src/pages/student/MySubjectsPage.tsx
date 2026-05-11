import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface SubjectAssignment {
  id: string;
  academicYear: number;
  subject: {
    id: string;
    name: string;
    description?: string | null;
    bookRequired?: string | null;
  };
  teacher: { id: string; name: string; email: string };
}

export function MySubjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.class) { setLoading(false); return; }
    api.get<SubjectAssignment[]>(`/api/subject-assignments?classId=${user.class.id}`)
      .then(setAssignments)
      .catch(() => setError("Failed to load subjects"))
      .finally(() => setLoading(false));
  }, [user?.class?.id]);

  if (!user?.class) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Subjects</h1>
        <p className="text-gray-400 text-sm">You are not assigned to a class yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
        <span className="text-gray-400 text-sm">
          Class {user.class.year}/{user.class.name}
        </span>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : assignments.length === 0 ? (
        <p className="text-gray-400 text-sm">No subjects assigned to your class yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/student/grades?assignmentId=${a.id}`)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition cursor-pointer"
            >
              <h2 className="font-semibold text-gray-900 mb-1">{a.subject.name}</h2>

              {a.subject.description && (
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{a.subject.description}</p>
              )}

              <div className="space-y-1 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-16 text-xs">Teacher</span>
                  <span className="text-gray-700">{a.teacher.name}</span>
                </div>
                {a.subject.bookRequired && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 w-16 text-xs">Book</span>
                    <span className="text-gray-700">{a.subject.bookRequired}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-16 text-xs">Year</span>
                  <span className="text-gray-700">{a.academicYear}/{a.academicYear + 1}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <span className="text-blue-500 text-xs font-medium">View grades →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
