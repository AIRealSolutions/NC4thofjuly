import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard — wraps all /admin routes.
 * - While auth is loading: shows a spinner
 * - If unauthenticated: shows a login prompt
 * - If authenticated but not admin or committee: shows an access-denied screen
 * - If admin or committee: renders children
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-patriot-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-patriot-100 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-patriot-600" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-navy-900 mb-2">Staff Portal</h1>
            <p className="text-muted-foreground text-sm">
              This area is restricted to NC 4th of July Festival committee members and administrators.
              Please sign in to continue.
            </p>
          </div>
          <Button
            className="w-full bg-patriot-600 hover:bg-patriot-700 text-white"
            onClick={() => { window.location.href = getLoginUrl(); }}
          >
            Sign In to Continue
          </Button>
          <a href="/" className="block text-sm text-muted-foreground hover:text-navy-700 transition-colors">
            ← Return to Public Site
          </a>
        </div>
      </div>
    );
  }

  if (user.role !== "admin" && user.role !== "committee") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-navy-900 mb-2">Access Denied</h1>
            <p className="text-muted-foreground text-sm">
              Your account does not have permission to access the staff portal.
              Please contact the festival administrator if you believe this is an error.
            </p>
          </div>
          <a href="/" className="block text-sm text-muted-foreground hover:text-navy-700 transition-colors">
            ← Return to Public Site
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
