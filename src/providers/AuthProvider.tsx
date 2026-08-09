import { AuthContext } from "@/context/auth-context";
import userAtom from "@/stores/user.atom";
import { useAtomValue } from "jotai/react";
import Cookies from "js-cookie";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAtomValue(userAtom);

  return (
    <AuthContext.Provider
      value={{
        accessToken: Cookies.get("access_token") || null,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
