import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ClassManagementPage } from "./pages/admin/ClassManagementPage";
import { SubjectAssignmentsPage } from "./pages/admin/SubjectAssignmentsPage";
import { SubjectManagementPage } from "./pages/admin/SubjectManagementPage";
import { UserManagementPage } from "./pages/admin/UserManagementPage";
import { MyGradesPage } from "./pages/student/MyGradesPage";
import { MySubjectsPage } from "./pages/student/MySubjectsPage";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { AdminManagementPage } from "./pages/superadmin/AdminManagementPage";
import { SuperAdminDashboard } from "./pages/superadmin/SuperAdminDashboard";
import { GradeEntryPage } from "./pages/teacher/GradeEntryPage";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { TeacherSubjectsPage } from "./pages/teacher/TeacherSubjectsPage";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case "STUDENT":    return <Navigate to="/student" replace />;
    case "TEACHER":    return <Navigate to="/teacher" replace />;
    case "ADMIN":      return <Navigate to="/admin" replace />;
    case "SUPERADMIN": return <Navigate to="/superadmin" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* All authenticated routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<RootRedirect />} />

              {/* Student routes */}
              <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
                <Route path="student" element={<StudentDashboard />} />
                <Route path="student/subjects" element={<MySubjectsPage />} />
                <Route path="student/grades" element={<MyGradesPage />} />
              </Route>

              {/* Teacher routes */}
              <Route element={<ProtectedRoute roles={["TEACHER"]} />}>
                <Route path="teacher" element={<TeacherDashboard />} />
                <Route path="teacher/subjects" element={<TeacherSubjectsPage />} />
                <Route path="teacher/grades" element={<GradeEntryPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute roles={["ADMIN", "SUPERADMIN"]} />}>
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<UserManagementPage />} />
                <Route path="admin/classes" element={<ClassManagementPage />} />
                <Route path="admin/subjects" element={<SubjectManagementPage />} />
                <Route path="admin/assignments" element={<SubjectAssignmentsPage />} />
              </Route>

              {/* SuperAdmin routes */}
              <Route element={<ProtectedRoute roles={["SUPERADMIN"]} />}>
                <Route path="superadmin" element={<SuperAdminDashboard />} />
                <Route path="superadmin/admins" element={<AdminManagementPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
