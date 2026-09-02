import { useAuth } from "@/hooks/use-auth";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being resolved
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--meesho-pink)]" />
        <p className="text-sm text-muted-foreground mt-4">Loading session...</p>
      </div>
    );
  }

  // If not authenticated (and not loading), redirect to auth
  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  return children;
}
