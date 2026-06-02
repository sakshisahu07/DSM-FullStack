import { Link, useRouterState } from "@tanstack/react-router";
import { memo, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { navGroups, dashboardItem, notificationsItem, liveSupportItem } from "@/lib/nav";
import logo from "@/assets/dsm-logo.png";

interface Props {
  collapsed: boolean;
  onNavigate?: () => void;
}

function AppSidebarImpl({ collapsed, onNavigate }: Props) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const initialOpen = useMemo(() => {
    const found = navGroups.find((g) => g.items.some((i) => path.startsWith(i.url)));
    return found?.title ?? "Products"; // Default to Products open
  }, [path]);

  const [openGroup, setOpenGroup] = useState<string | null>(initialOpen);

  useEffect(() => {
    if (initialOpen) setOpenGroup(initialOpen);
  }, [initialOpen]);

  if (collapsed) {
    return (
      <aside className="h-screen sticky top-0 shrink-0 w-[64px] bg-sidebar-rail text-sidebar-rail-foreground border-r border-white/5 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <div className="h-9 w-9 rounded-lg bg-white/95 p-1 flex items-center justify-center">
            <img src={logo} alt="DSM" className="h-full w-full object-contain" />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
          {[dashboardItem, ...navGroups, notificationsItem, liveSupportItem].map((it: any) => {
            const Icon = it.icon;
            const url = it.url ?? it.items?.[0]?.url ?? "#";
            const active =
              "url" in it && it.url
                ? path === it.url
                : it.items?.some((i: any) => path.startsWith(i.url));
            return (
              <Link
                key={it.title}
                to={url}
                title={it.title}
                onClick={onNavigate}
                className={cn(
                  "flex items-center justify-center h-10 w-full rounded-lg transition-colors",
                  active
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                    : "text-sidebar-rail-foreground/70 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  const linkCls = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
      active
        ? "bg-primary/15 text-primary font-medium"
        : "text-sidebar-rail-foreground/80 hover:text-white hover:bg-white/5",
    );

  return (
    <aside className="h-screen sticky top-0 shrink-0 w-[260px] bg-sidebar-rail text-sidebar-rail-foreground border-r border-white/5 flex flex-col">
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10">
        <div className="h-9 w-9 rounded-lg bg-white/95 p-1 flex items-center justify-center">
          <img src={logo} alt="DSM" className="h-full w-full object-contain" />
        </div>
        <span className="font-semibold tracking-tight text-white">DSM Electro</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        <Link
          to={dashboardItem.url}
          onClick={onNavigate}
          className={linkCls(path === dashboardItem.url)}
        >
          <dashboardItem.icon className="h-4 w-4" />
          <span>{dashboardItem.title}</span>
        </Link>

        {navGroups.map((g) => {
          const Icon = g.icon;
          const isOpen = openGroup === g.title;
          const hasActive = g.items.some((i) => path.startsWith(i.url));
          return (
            <div key={g.title}>
              <button
                onClick={() => setOpenGroup((k) => (k === g.title ? null : g.title))}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  hasActive
                    ? "text-white"
                    : "text-sidebar-rail-foreground/80 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{g.title}</span>
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                />
              </button>
              {isOpen && (
                <ul className="mt-0.5 mb-1 ml-7 border-l border-white/10 pl-2 space-y-0.5">
                  {g.items.map((i) => {
                    const active = path === i.url || path.startsWith(i.url + "/");
                    return (
                      <li key={i.url}>
                        <Link
                          to={i.url}
                          onClick={onNavigate}
                          className={cn(
                            "block px-3 py-1.5 rounded-md text-[13px] transition-colors",
                            active
                              ? "bg-primary/15 text-primary font-medium"
                              : "text-sidebar-rail-foreground/70 hover:text-white hover:bg-white/5",
                          )}
                        >
                          {i.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        <Link
          to={notificationsItem.url}
          onClick={onNavigate}
          className={linkCls(path === notificationsItem.url)}
        >
          <notificationsItem.icon className="h-4 w-4" />
          <span>{notificationsItem.title}</span>
        </Link>

        <Link
          to={liveSupportItem.url}
          onClick={onNavigate}
          className={linkCls(path === liveSupportItem.url)}
        >
          <liveSupportItem.icon className="h-4 w-4" />
          <span>{liveSupportItem.title}</span>
        </Link>
      </nav>
    </aside>
  );
}

export const AppSidebar = memo(AppSidebarImpl);
