import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api/client";
import { storage } from "../storage";

export type Role = "SUPERADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  class?: { id: string; year: number; name: string } | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getToken().then((token) => {
      if (!token) { setLoading(false); return; }
      api.get<AuthUser>("/api/auth/me")
        .then(setUser)
        .catch(() => storage.removeToken())
        .finally(() => setLoading(false));
    });
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; user: AuthUser }>("/api/auth/login", { email, password });
    await storage.setToken(res.token);
    setUser(res.user);
  }

  async function logout() {
    await storage.removeToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
