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
  subject: { id: string; name: string; description?: string };
  class: { id: string; year: number; name: string };
  teacher: { id: string; name: string };
}

export function StudentSubjectsScreen() {
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
        <Text style={styles.empty}>No subjects found for your class</Text>
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
          onPress={() => navigation.navigate("Grades", { assignmentId: item.id })}
        >
          <Text style={styles.subjectName}>{item.subject.name}</Text>
          {item.subject.description ? (
            <Text style={styles.desc} numberOfLines={2}>
              {item.subject.description}
            </Text>
          ) : null}
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              Class {item.class.year}/{item.class.name}
            </Text>
            <Text style={styles.metaText}>{item.teacher.name}</Text>
            <Text style={styles.metaText}>{item.academicYear}/{item.academicYear + 1}</Text>
          </View>
          <Text style={styles.tapHint}>Tap to view grades →</Text>
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
  subjectName: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 },
  desc: { fontSize: 13, color: "#6b7280", marginBottom: 8, lineHeight: 18 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
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
