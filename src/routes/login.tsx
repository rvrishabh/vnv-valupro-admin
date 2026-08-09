import { authApi } from "@/api/auth.api";
import logoFullLight from "@/assets/logo-full-light.png";
import logoFull from "@/assets/logo-full.png";
import FormInput from "@/components/Form/FormInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UseAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  component: LoginPage,
});

function LoginPage() {
  const { login } = UseAuth();
  const { redirect: redirectTo } = Route.useSearch();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    try {
      const { user } = await authApi.login(values);
      if (user.role?.name !== "ADMIN") {
        await authApi.logout();
        setFormError("This portal is for administrators only.");
        return;
      }
      login(user);
      // Hard redirect: jotai's atomWithStorage persists synchronously to
      // localStorage, but the router's `auth` context is a React value that
      // only updates on the next render. A client-side navigate() here can
      // race the _authenticated guard's beforeLoad and bounce back to
      // /login before the new context is committed. A full reload avoids
      // the race — AuthProvider reads localStorage synchronously on boot.
      window.location.href = redirectTo || "/";
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Hero panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-[var(--navy-deep)]">
        <div className="absolute inset-0 blueprint-grid pointer-events-none" />
        <div className="relative z-10">
          <img src={logoFullLight} alt="VNV Engineers" className="h-14 w-auto" />
        </div>
        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="font-display text-3xl font-semibold text-[var(--paper)] leading-tight">
            VNV ValuPro
          </h2>
          <div className="gold-rule w-24" />
          <p className="text-[var(--steel)] text-sm leading-relaxed">
            Administrative console for managing institutions, branches, staff
            approvals, and valuation records across the VNV Engineers
            platform.
          </p>
        </div>
        <div className="relative z-10 text-xs text-[var(--steel-deep)]">
          &copy; {new Date().getFullYear()} VNV Engineers. All rights reserved.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col items-center gap-4 lg:hidden">
            <img src={logoFull} alt="VNV Engineers" className="h-12 w-auto" />
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Admin Sign In
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the admin console.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="admin@vnvengineers.com"
                required
              />
              <FormInput
                control={form.control}
                name="password"
                label="Password"
                isPassword
                placeholder="••••••••"
                required
              />

              {formError && (
                <p className="text-sm text-destructive pt-1">{formError}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
