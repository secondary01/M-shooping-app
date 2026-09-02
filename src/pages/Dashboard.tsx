import { Outlet, Navigate, useLocation } from "react-router";
import { BottomNav } from "@/components/BottomNav";

export default function Dashboard() {
  const location = useLocation();

  if (location.pathname === "/dashboard") {
    return <Navigate to="/dashboard/home" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
