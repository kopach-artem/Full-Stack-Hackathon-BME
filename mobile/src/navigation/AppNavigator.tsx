import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { AdminPortalScreen } from "../screens/AdminPortalScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/student/DashboardScreen";
import { StudentGradesScreen } from "../screens/student/GradesScreen";
import { StudentSubjectsScreen } from "../screens/student/SubjectsScreen";
import { TeacherGradeEntryScreen } from "../screens/teacher/GradeEntryScreen";
import { TeacherSubjectsScreen } from "../screens/teacher/SubjectsScreen";

const Stack = createNativeStackNavigator();
const StudentTab = createBottomTabNavigator();
const TeacherTab = createBottomTabNavigator();

const TAB_OPTIONS = {
  tabBarActiveTintColor: "#166534",
  tabBarInactiveTintColor: "#9ca3af",
  tabBarStyle: { borderTopColor: "#e5e7eb" },
  headerStyle: { backgroundColor: "#166534" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "bold" as const },
};

function tabIcon(label: string, focused: boolean) {
  const icons: Record<string, string> = {
    Home: "⌂", Subjects: "📚", Grades: "📊",
    "My Subjects": "📚", "Enter Grades": "✏️",
  };
  return (
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? "●"}
    </Text>
  );
}

function StudentTabs() {
  return (
    <StudentTab.Navigator screenOptions={TAB_OPTIONS}>
      <StudentTab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ focused }) => tabIcon("Home", focused) }}
      />
      <StudentTab.Screen
        name="Subjects"
        component={StudentSubjectsScreen}
        options={{ tabBarIcon: ({ focused }) => tabIcon("Subjects", focused) }}
      />
      <StudentTab.Screen
        name="Grades"
        component={StudentGradesScreen}
        options={{ tabBarIcon: ({ focused }) => tabIcon("Grades", focused) }}
      />
    </StudentTab.Navigator>
  );
}

function TeacherTabs() {
  return (
    <TeacherTab.Navigator screenOptions={TAB_OPTIONS}>
      <TeacherTab.Screen
        name="My Subjects"
        component={TeacherSubjectsScreen}
        options={{ tabBarIcon: ({ focused }) => tabIcon("My Subjects", focused) }}
      />
      <TeacherTab.Screen
        name="Enter Grades"
        component={TeacherGradeEntryScreen}
        options={{ tabBarIcon: ({ focused }) => tabIcon("Enter Grades", focused) }}
      />
    </TeacherTab.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role === "STUDENT" ? (
        <Stack.Screen name="StudentApp" component={StudentTabs} />
      ) : user.role === "TEACHER" ? (
        <Stack.Screen name="TeacherApp" component={TeacherTabs} />
      ) : (
        <Stack.Screen name="AdminPortal" component={AdminPortalScreen} />
      )}
    </Stack.Navigator>
  );
}
