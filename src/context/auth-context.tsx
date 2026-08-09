import { createContext } from "react";

export interface AuthContextProps {
  accessToken: string | null;
  user: { id: string | null; email: string | null } | null;
}

export const AuthContext = createContext<AuthContextProps | null>(null);
