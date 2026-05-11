import { Platform } from "react-native";

// Android emulator: 10.0.2.2  |  iOS simulator / web: localhost  |  Physical device: your LAN IP
const defaultApiUrl = Platform.OS === "android"
  ? "http://10.0.2.2:4000"
  : "http://localhost:4000";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl;
