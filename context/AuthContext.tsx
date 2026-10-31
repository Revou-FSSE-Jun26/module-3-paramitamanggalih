"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "customer" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const STORAGE_KEY = "revoshop_user";
const ROLE_COOKIE = "revoshop_role";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function updateRoleCookie(role: UserRole | null) {
  const secure =
    window.location.protocol === "https:" ? "; Secure" : "";

  if (role) {
    document.cookie =
      `${ROLE_COOKIE}=${role}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
  } else {
    document.cookie =
      `${ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);

      if (savedUser) {
        const parsed: unknown = JSON.parse(savedUser);

        if (parsed && typeof parsed === "object") {
          const candidate = parsed as Record<string, unknown>;

          if (
            typeof candidate.id === "number" &&
            typeof candidate.name === "string" &&
            typeof candidate.email === "string"
          ) {
            const restoredUser: AuthUser = {
              id: candidate.id,
              name: candidate.name,
              email: candidate.email,
              role: candidate.role === "admin" ? "admin" : "customer",
            };

            setUser(restoredUser);
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(restoredUser)
            );
            updateRoleCookie(restoredUser.role);
          } else {
            localStorage.removeItem(STORAGE_KEY);
            updateRoleCookie(null);
          }
        } else {
          localStorage.removeItem(STORAGE_KEY);
          updateRoleCookie(null);
        }
      } else {
        updateRoleCookie(null);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      updateRoleCookie(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((nextUser: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    updateRoleCookie(nextUser.role);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    updateRoleCookie(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
