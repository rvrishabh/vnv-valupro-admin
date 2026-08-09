import { AuthContext } from "@/context/auth-context";
import { useContext } from "react";

export function UseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
