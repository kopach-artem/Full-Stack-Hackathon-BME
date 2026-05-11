import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../api/client";

interface Assignment {
  id: string;
  academicYear: number;
  subject: { id: string; name: string };
  class: { id: string; year: number; name: string };
  _count: { grades: number };
}

export function TeacherSubjectsScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    api
      .get<Assignment[]>("/api/subject-assignments")
      .then(setAssignments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  if (assignments.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No subjects assigned to you</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={assignments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Enter Grades", { assignmentId: item.id })}
        >
          <View style={styles.top}>
            <Text style={styles.subjectName}>{item.subject.name}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{item._count.grades} grades</Text>
            </View>
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              Class {item.class.year}/{item.class.name}
            </Text>
            <Text style={styles.metaText}>
              {item.academicYear}/{item.academicYear + 1}
            </Text>
          </View>
          <Text style={styles.tapHint}>Tap to enter grades →</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  empty: { color: "#9ca3af", fontSize: 14, textAlign: "center" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  subjectName: { fontSize: 16, fontWeight: "600", color: "#111827", flex: 1 },
  countBadge: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { fontSize: 12, color: "#166534", fontWeight: "600" },
  meta: { flexDirection: "row", gap: 8, marginBottom: 8 },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tapHint: { fontSize: 12, color: "#2563eb", fontWeight: "500" },
});
