import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";
import { AppNavbar } from "./app-navbar";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Auth gate: only need to check once on mount — subsequent navigations
  // stay inside the protected layout. Avoids re-running on every path change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("dsm_token");
    if (!token || token === "undefined") {
      navigate({ to: "/login" });
    }
  }, [navigate]);


  const toggleSidebar = useCallback(() => setCollapsed((c) => !c), []);

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar collapsed={collapsed} />
      <div className="flex-1 min-w-0 flex flex-col">
        <AppNavbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
