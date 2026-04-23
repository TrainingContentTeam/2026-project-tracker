import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Allow viewing the dashboard and course detail pages without login.
  // Login is only required for actions that mutate data (handled in the UI).
  const isPublic =
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/courses/");

  useEffect(() => {
    if (loading) return;
    if (!session && !isPublic) {
      navigate({ to: "/login", replace: true });
    } else if (session && pathname === "/login") {
      navigate({ to: "/", replace: true });
    }
  }, [session, loading, isPublic, pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session && !isPublic) {
    return null;
  }

  return <>{children}</>;
}