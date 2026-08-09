import type { User } from "@/types/user.types";
import { createContext } from "react";

export interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);
