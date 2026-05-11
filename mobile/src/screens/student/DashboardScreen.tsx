import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {user?.name}!</Text>
        <Text style={styles.classInfo}>
          {user?.class
            ? `Class ${user.class.year}/${user.class.name}`
            : "Not assigned to a class"}
        </Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Subjects")}>
        <Text style={styles.cardIcon}>📚</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>My Subjects</Text>
          <Text style={styles.cardDesc}>View subjects assigned to your class</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Grades")}>
        <Text style={styles.cardIcon}>📊</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>My Grades</Text>
          <Text style={styles.cardDesc}>View your grades and averages</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 16, gap: 12 },
  header: {
    backgroundColor: "#166534",
    borderRadius: 14,
    padding: 20,
    marginBottom: 4,
  },
  welcome: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  classInfo: { fontSize: 14, color: "#bbf7d0", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 2 },
  cardDesc: { fontSize: 13, color: "#6b7280" },
  arrow: { fontSize: 22, color: "#9ca3af" },
  logoutBtn: {
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  logoutText: { color: "#6b7280", fontWeight: "500" },
});
