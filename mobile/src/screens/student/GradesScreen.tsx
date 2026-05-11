import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../api/client";

interface Grade {
  id: string;
  value: number;
  type: "REGULAR" | "SEMESTER" | "YEAR_END";
  weight: number;
  description?: string;
  createdAt: string;
  subjectAssignment: {
    id: string;
    subject: { name: string };
    class: { year: number; name: string };
  };
}

interface Group {
  assignmentId: string;
  subjectName: string;
  className: string;
  regular: Grade[];
  semester: Grade[];
  yearEnd: Grade[];
}

function weightedAvg(grades: Grade[]): string {
  if (!grades.length) return "—";
  const total = grades.reduce((s, g) => s + g.value * g.weight, 0);
  const weights = grades.reduce((s, g) => s + g.weight, 0);
  return (total / weights).toFixed(2);
}

function gradeColor(v: number) {
  if (v >= 5) return { bg: "#dcfce7", text: "#166534" };
  if (v >= 4) return { bg: "#dbeafe", text: "#1d4ed8" };
  if (v >= 3) return { bg: "#fef3c7", text: "#92400e" };
  return { bg: "#fee2e2", text: "#dc2626" };
}

function GradeRow({ grade }: { grade: Grade }) {
  const c = gradeColor(grade.value);
  return (
    <View style={rowStyles.row}>
      <View style={[rowStyles.badge, { backgroundColor: c.bg }]}>
        <Text style={[rowStyles.value, { color: c.text }]}>{grade.value}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={rowStyles.desc}>{grade.description ?? "—"}</Text>
        <Text style={rowStyles.meta}>×{grade.weight}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 },
  badge: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  value: { fontSize: 16, fontWeight: "bold" },
  desc: { fontSize: 13, color: "#374151" },
  meta: { fontSize: 11, color: "#9ca3af" },
});

export function StudentGradesScreen() {
  const route = useRoute<any>();
  const focusedId = route.params?.assignmentId as string | undefined;

  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get<Grade[]>("/api/grades").then(setGrades).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (focusedId) setExpanded(focusedId);
  }, [focusedId]);

  const groups: Group[] = [];
  for (const g of grades) {
    let entry = groups.find((e) => e.assignmentId === g.subjectAssignment.id);
    if (!entry) {
      entry = {
        assignmentId: g.subjectAssignment.id,
        subjectName: g.subjectAssignment.subject.name,
        className: `${g.subjectAssignment.class.year}/${g.subjectAssignment.class.name}`,
        regular: [],
        semester: [],
        yearEnd: [],
      };
      groups.push(entry);
    }
    if (g.type === "REGULAR") entry.regular.push(g);
    else if (g.type === "SEMESTER") entry.semester.push(g);
    else entry.yearEnd.push(g);
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
      {groups.length === 0 ? (
        <Text style={styles.empty}>No grades yet</Text>
      ) : (
        groups.map((group) => {
          const isOpen = expanded === group.assignmentId;
          const avg = weightedAvg(group.regular);
          return (
            <View key={group.assignmentId} style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => setExpanded(isOpen ? null : group.assignmentId)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.subjectName}>{group.subjectName}</Text>
                  <Text style={styles.className}>{group.className}</Text>
                </View>
                <View style={styles.avgBadge}>
                  <Text style={styles.avgText}>{avg}</Text>
                </View>
                <Text style={styles.chevron}>{isOpen ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.body}>
                  {group.regular.length > 0 && (
                    <>
                      <Text style={styles.sectionLabel}>Regular</Text>
                      {group.regular.map((g) => <GradeRow key={g.id} grade={g} />)}
                    </>
                  )}
                  {group.semester.length > 0 && (
                    <>
                      <Text style={styles.sectionLabel}>Semester</Text>
                      {group.semester.map((g) => <GradeRow key={g.id} grade={g} />)}
                    </>
                  )}
                  {group.yearEnd.length > 0 && (
                    <>
                      <Text style={styles.sectionLabel}>Year End</Text>
                      {group.yearEnd.map((g) => <GradeRow key={g.id} grade={g} />)}
                    </>
                  )}
                  {group.regular.length > 0 && (
                    <View style={styles.avgRow}>
                      <Text style={styles.avgLabel}>Regular avg</Text>
                      <Text style={styles.avgValue}>{avg}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { color: "#9ca3af", fontSize: 14, textAlign: "center", marginTop: 48 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 16, gap: 10 },
  subjectName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  className: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  avgBadge: {
    backgroundColor: "#f0fdf4",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  avgText: { fontSize: 13, color: "#166534", fontWeight: "700" },
  chevron: { color: "#9ca3af", fontSize: 12 },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 4,
  },
  avgRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  avgLabel: { fontSize: 13, color: "#6b7280" },
  avgValue: { fontSize: 15, fontWeight: "bold", color: "#166534" },
});
