import { queryClient, router } from "@/main";
import { RouterProvider } from "@tanstack/react-router";
import { UseAuth } from "../hooks/useAuth";

export default function InnerApp() {
  const auth = UseAuth();
  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}
