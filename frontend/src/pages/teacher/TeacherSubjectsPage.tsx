import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

interface Assignment {
  id: string;
  academicYear: number;
  subject: { id: string; name: string; description?: string | null };
  class: { id: string; year: number; name: string };
  _count: { grades: number };
}

export function TeacherSubjectsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Assignment[]>("/api/subject-assignments")
      .then(setAssignments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Subjects</h1>

      {assignments.length === 0 ? (
        <p className="text-gray-400 text-sm">You have no subject assignments yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/teacher/grades?assignmentId=${a.id}`)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold text-gray-900">{a.subject.name}</h2>
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                  {a.academicYear}/{a.academicYear + 1}
                </span>
              </div>
              <p className="text-blue-600 font-medium text-sm mb-1">
                Class {a.class.year}/{a.class.name}
              </p>
              {a.subject.description && (
                <p className="text-gray-400 text-xs mb-3 line-clamp-2">{a.subject.description}</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-gray-400 text-xs">{a._count.grades} grades entered</span>
                <span className="text-blue-500 text-xs font-medium">Enter grades →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
