import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, Search, Bell, Sun, Moon, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme";
import { navGroups, dashboardItem } from "@/lib/nav";
import { LiveClock } from "./live-clock";
import { LiveSupportBadges } from "./support-badges";



// Lazy: keeps cmdk + mock data out of the initial bundle until first ⌘K.
const CommandPalette = lazy(() =>
  import("@/components/command-palette").then((m) => ({ default: m.CommandPalette })),
);

interface Props {
  onToggleSidebar: () => void;
}

export function AppNavbar({ onToggleSidebar }: Props) {
  const { theme, toggle } = useTheme();
   const [openCmd, setOpenCmd] = useState(false);
   const path = useRouterState({ select: (s) => s.location.pathname });

  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenCmd((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const crumbs = useMemo(() => buildCrumbs(path), [path]);

  const logout = useCallback(() => {
    localStorage.removeItem("dsm_token");
    navigate({ to: "/login" });
  }, [navigate]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur shadow-sm transition-all duration-300">


      <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground/50">/</span>}
            {c.url ? (
              <Link to={c.url} className="hover:text-foreground transition-colors">{c.label}</Link>
            ) : (
              <span className="text-foreground font-medium">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

       <div className="flex-1 flex items-center justify-end gap-3 pr-2">
         <div className="hidden xl:flex items-center gap-3 mr-2">
           <LiveSupportBadges onClickChat={() => navigate({ to: "/support" })} />
           <LiveClock />
         </div>


        <div className="flex items-center gap-2 border-l pl-3">
          <button
            onClick={() => setOpenCmd(true)}
            className="hidden md:flex items-center justify-center h-9 w-9 rounded-full border bg-muted/30 text-muted-foreground hover:bg-muted transition-all"
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4" />
          </button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpenCmd(true)}>
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="h-9 w-9 rounded-full">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link to="/notifications">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <Badge className="absolute top-1 right-1 h-4 min-w-4 px-1 text-[9px] bg-red-500 text-white border-0">5</Badge>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-1 gap-2 hover:bg-transparent">
                <Avatar className="h-8 w-8 ring-2 ring-muted border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">AD</AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[12px] font-bold">Admin</span>
                  <span className="text-[10px] text-muted-foreground">Super Admin</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-medium text-sm">Admin User</div>
                <div className="text-[11px] text-muted-foreground">admin@dsmelectro.in</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile"><User className="h-4 w-4 mr-2" />Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggle}>
                {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                Toggle theme
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings/company"><Settings className="h-4 w-4 mr-2" />Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive text-sm font-medium">
                <LogOut className="h-4 w-4 mr-2" />Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>



       {/* Mounted only after first open to avoid eager dialog/list cost. */}
       {openCmd && (
         <Suspense fallback={null}>
           <CommandPalette open={openCmd} onOpenChange={setOpenCmd} />
         </Suspense>
       )}
 
     </header>

  );
}

// Precomputed once — avoids flatMap + find on every route change.
const ITEM_BY_URL = new Map<string, string>(
  navGroups.flatMap((g) => g.items.map((i) => [i.url, i.title] as const)),
);
const GROUP_BY_SLUG = new Map<string, string>(
  navGroups.map((g) => [g.title.toLowerCase(), g.title] as const),
);

function buildCrumbs(path: string): { label: string; url?: string }[] {
  if (path === "/dashboard") return [{ label: "Dashboard" }];
  const parts = path.split("/").filter(Boolean);
  const out: { label: string; url?: string }[] = [{ label: "Home", url: "/dashboard" }];
  let cur = "";
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    cur += "/" + p;
    out.push({
      label:
        ITEM_BY_URL.get(cur) ??
        GROUP_BY_SLUG.get(p) ??
        (p === "dashboard" && i === 0 ? dashboardItem.title : cap(p)),
      url: i === parts.length - 1 ? undefined : cur,
    });
  }
  return out;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}
