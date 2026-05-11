import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../api/client";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Grade {
  id: string;
  value: number;
  type: "REGULAR" | "SEMESTER" | "YEAR_END";
  weight: number;
  description?: string;
  student: { id: string; name: string };
}

interface Assignment {
  id: string;
  academicYear: number;
  subject: { name: string };
  class: { id: string; year: number; name: string };
}

function weightedAvg(grades: Grade[]): string {
  const regular = grades.filter((g) => g.type === "REGULAR");
  if (!regular.length) return "—";
  const total = regular.reduce((s, g) => s + g.value * g.weight, 0);
  const weights = regular.reduce((s, g) => s + g.weight, 0);
  return (total / weights).toFixed(2);
}

function badgeBg(v: number) {
  if (v >= 5) return "#dcfce7";
  if (v >= 4) return "#dbeafe";
  if (v >= 3) return "#fef3c7";
  return "#fee2e2";
}

export function TeacherGradeEntryScreen() {
  const route = useRoute<any>();
  const assignmentId = route.params?.assignmentId as string | undefined;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const [formValue, setFormValue] = useState(4);
  const [formType, setFormType] = useState<"REGULAR" | "SEMESTER" | "YEAR_END">("REGULAR");
  const [formWeight, setFormWeight] = useState(1);
  const [formDesc, setFormDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);
    try {
      const [allAssignments, gradesData] = await Promise.all([
        api.get<Assignment[]>("/api/subject-assignments"),
        api.get<Grade[]>(`/api/grades?subjectAssignmentId=${assignmentId}`),
      ]);
      const found = allAssignments.find((a) => a.id === assignmentId) ?? null;
      setAssignment(found);
      setGrades(gradesData);
      if (found?.class?.id) {
        const cls = await api.get<{ students: Student[] }>(`/api/classes/${found.class.id}`);
        setStudents(cls.students ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleAddGrade(studentId: string) {
    setSubmitting(true);
    try {
      await api.post("/api/grades", {
        value: formValue,
        type: formType,
        weight: formWeight,
        description: formDesc || undefined,
        studentId,
        subjectAssignmentId: assignmentId,
      });
      setFormDesc("");
      await loadData();
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to add grade");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteGrade(gradeId: string) {
    Alert.alert("Delete Grade", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/grades/${gradeId}`);
            await loadData();
          } catch (err: any) {
            Alert.alert("Error", err?.message ?? "Failed to delete");
          }
        },
      },
    ]);
  }

  if (!assignmentId) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>← Select a subject from the My Subjects tab</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {assignment && (
        <View style={styles.assignmentCard}>
          <Text style={styles.assignmentSubject}>{assignment.subject.name}</Text>
          <Text style={styles.assignmentMeta}>
            Class {assignment.class.year}/{assignment.class.name} · {assignment.academicYear}/{assignment.academicYear + 1}
          </Text>
        </View>
      )}

      {students.map((student) => {
        const studentGrades = grades.filter((g) => g.student.id === student.id);
        const isOpen = expandedStudent === student.id;
        const avg = weightedAvg(studentGrades);

        return (
          <View key={student.id} style={styles.studentCard}>
            <TouchableOpacity
              style={styles.studentHeader}
              onPress={() => setExpandedStudent(isOpen ? null : student.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentEmail}>{student.email}</Text>
              </View>
              <Text style={styles.avgText}>avg {avg}</Text>
              <Text style={styles.chevron}>{isOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.studentBody}>
                {studentGrades.length === 0 ? (
                  <Text style={styles.noGrades}>No grades yet</Text>
                ) : (
                  studentGrades.map((g) => (
                    <View key={g.id} style={styles.gradeRow}>
                      <View style={[styles.gradeBadge, { backgroundColor: badgeBg(g.value) }]}>
                        <Text style={styles.gradeVal}>{g.value}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.gradeDesc}>{g.description ?? "—"}</Text>
                        <Text style={styles.gradeMeta}>
                          {g.type.toLowerCase()} · ×{g.weight}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteGrade(g.id)}>
                        <Text style={styles.deleteBtn}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                <View style={styles.form}>
                  <Text style={styles.formTitle}>Add Grade</Text>

                  <Text style={styles.formLabel}>Value</Text>
                  <View style={styles.btnRow}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <TouchableOpacity
                        key={v}
                        style={[styles.segBtn, formValue === v && styles.segBtnActive]}
                        onPress={() => setFormValue(v)}
                      >
                        <Text style={[styles.segBtnText, formValue === v && styles.segBtnTextActive]}>
                          {v}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>Type</Text>
                  <View style={styles.btnRow}>
                    {(["REGULAR", "SEMESTER", "YEAR_END"] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.typeBtn, formType === t && styles.segBtnActive]}
                        onPress={() => setFormType(t)}
                      >
                        <Text style={[styles.typeBtnText, formType === t && styles.segBtnTextActive]}>
                          {t === "YEAR_END" ? "Year End" : t.charAt(0) + t.slice(1).toLowerCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>Weight</Text>
                  <View style={styles.btnRow}>
                    {[1, 2, 3, 4, 5].map((w) => (
                      <TouchableOpacity
                        key={w}
                        style={[styles.segBtn, formWeight === w && styles.segBtnActive]}
                        onPress={() => setFormWeight(w)}
                      >
                        <Text style={[styles.segBtnText, formWeight === w && styles.segBtnTextActive]}>
                          ×{w}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Description (optional)"
                    placeholderTextColor="#9ca3af"
                    value={formDesc}
                    onChangeText={setFormDesc}
                  />

                  <TouchableOpacity
                    style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                    onPress={() => handleAddGrade(student.id)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.submitBtnText}>Add Grade</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  hint: { color: "#9ca3af", fontSize: 14, textAlign: "center", lineHeight: 22 },
  assignmentCard: {
    backgroundColor: "#166534",
    borderRadius: 14,
    padding: 16,
  },
  assignmentSubject: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  assignmentMeta: { fontSize: 13, color: "#bbf7d0", marginTop: 4 },
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  studentHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 8 },
  studentName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  studentEmail: { fontSize: 12, color: "#9ca3af" },
  avgText: { fontSize: 13, color: "#166534", fontWeight: "700" },
  chevron: { color: "#9ca3af", fontSize: 12 },
  studentBody: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    padding: 14,
  },
  noGrades: { color: "#9ca3af", fontSize: 13, marginBottom: 10 },
  gradeRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 },
  gradeBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  gradeVal: { fontSize: 15, fontWeight: "bold", color: "#374151" },
  gradeDesc: { fontSize: 13, color: "#374151" },
  gradeMeta: { fontSize: 11, color: "#9ca3af" },
  deleteBtn: { color: "#ef4444", fontSize: 16, padding: 4 },
  form: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  formTitle: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 10 },
  formLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6, marginTop: 10 },
  btnRow: { flexDirection: "row", gap: 6 },
  segBtn: {
    width: 42,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  segBtnActive: { backgroundColor: "#166534", borderColor: "#166534" },
  segBtnText: { fontSize: 14, color: "#374151" },
  segBtnTextActive: { color: "#fff", fontWeight: "600" },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  typeBtnText: { fontSize: 11, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginTop: 10,
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  submitBtn: {
    backgroundColor: "#166534",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
