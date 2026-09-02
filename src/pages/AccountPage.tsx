import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { LogIn, User } from "lucide-react";

export default function AccountPage() {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <LogIn className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Log in to your account</h2>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
          Sign in to view your account settings.
        </p>
        <Button
          onClick={() => navigate("/auth?returnTo=/dashboard/account")}
          className="mt-6 bg-[var(--meesho-pink)] text-white"
        >
          Sign In
        </Button>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold">Account</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="bg-[var(--meesho-pink)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{user.name || "User"}</p>
              <p className="text-white/70 text-xs">{user.phone || "No phone"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">Wallet balance</p>
            <p className="text-xl font-bold">₹0</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="text-xl font-bold">0</p>
          </div>
        </div>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
