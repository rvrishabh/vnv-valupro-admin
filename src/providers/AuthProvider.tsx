import { authApi } from "@/api/auth.api";
import { AuthContext } from "@/context/auth-context";
import userAtom from "@/stores/user.atom";
import type { User } from "@/types/user.types";
import { useAtom } from "jotai/react";
import { useCallback, useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useAtom(userAtom);

  const login = useCallback(
    (loggedInUser: User) => {
      setUser(loggedInUser);
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout, still clear local state
    }
    setUser(null);
  }, [setUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [setUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
