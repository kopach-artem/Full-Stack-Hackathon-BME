import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export function AdminPortalScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Education Portal</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.hint}>
          Admin and SuperAdmin management functions are available on the web portal.
          Please use the web interface to manage users, classes, subjects, and assignments.
        </Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#166534",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 12 },
  roleBadge: {
    backgroundColor: "#166534",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 8,
  },
  roleText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  name: { fontSize: 16, color: "#374151", marginBottom: 16 },
  hint: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  logoutText: { color: "#374151", fontWeight: "500" },
});
