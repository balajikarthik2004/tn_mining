import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_ITEMS, NAV_SECTIONS } from "./navConfig";
import { BrandMark } from "../components/ui/BrandMark";

const COLLAPSE_STORAGE_KEY = "tn-mining:nav-collapsed";

/** Longest-prefix match so detail routes (/licensing/:id) still light up their parent. */
function useActiveNavItem() {
  const { pathname } = useLocation();
  return (
    [...NAV_ITEMS]
      .filter((item) => (item.path === "/" ? pathname === "/" : pathname.startsWith(item.path)))
      .sort((a, b) => b.path.length - a.path.length)[0] ?? NAV_ITEMS[0]
  );
}

export function Layout() {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1"
  );
  const { pathname } = useLocation();
  const activeItem = useActiveNavItem();

  // Close the drawer whenever the route changes.
  useEffect(() => setMobileNavOpen(false), [pathname]);

  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, prev ? "0" : "1");
      return !prev;
    });

  return (
    <div className="flex h-screen flex-col bg-canvas md:flex-row">
      {/* Mobile topbar */}
      <header className="chrome-deep flex shrink-0 items-center justify-between px-4 py-3 text-white md:hidden">
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
          className="rounded-xl bg-white/10 p-2 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/20"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="font-heading text-sm font-extrabold tracking-tight">TN Mining AI</span>
        <BrandMark className="h-6 w-6 text-gold-300" />
      </header>

      {/* Mobile nav drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 animate-fade-in bg-brand-950/60 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-10 h-full w-[19rem] max-w-[85vw] shadow-panel">
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 z-20 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar — collapses to an icon-only rail */}
      <aside
        className={`hidden shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:block ${isCollapsed ? "w-[4.75rem]" : "w-[17rem]"
          }`}
      >
        <SidebarContent isCollapsed={isCollapsed} onToggleCollapsed={toggleCollapsed} />
      </aside>

      {/* Topbar + page content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-bar z-20 hidden shrink-0 items-center justify-between gap-4 border-b border-neutral-border/80 px-6 py-3 md:flex">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="shrink-0 font-medium text-neutral-ink/45">
              Department of Geology &amp; Mining
            </span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-ink/25" aria-hidden="true" />
            <span className="truncate font-heading font-bold text-brand-900">{activeItem.label}</span>
          </div>
        </header>

        <main key={pathname} className="page-canvas min-w-0 flex-1 animate-fade-in overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  isCollapsed = false,
  onToggleCollapsed,
}: {
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  return (
    <div className="chrome-deep flex h-full flex-col text-white">
      {/* Brand lockup + collapse toggle */}
      <div
        className={`flex items-center py-[1.15rem] ${isCollapsed ? "flex-col gap-3 px-2" : "gap-3 px-5"}`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
          <BrandMark className="h-6 w-6 text-gold-300" />
        </div>

        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-[15px] font-extrabold leading-tight tracking-tight">
              TN Mining AI
            </p>
            <p className="truncate text-[11px] font-medium tracking-wide text-gold-300/90">
              Govt. of Tamil Nadu
            </p>
          </div>
        )}

        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Expand navigation" : "Collapse navigation"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <div className="mx-4 h-px bg-linear-to-r from-white/5 via-white/20 to-white/5" aria-hidden="true" />

      <nav
        className={`scrollbar-light flex-1 overflow-y-auto py-4 ${isCollapsed ? "space-y-3 px-2" : "space-y-5 px-3"}`}
      >
        {NAV_SECTIONS.map((section) => {
          const items = NAV_ITEMS.filter((item) => item.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section}>
              {isCollapsed ? (
                <div className="mx-3 mb-2 h-px bg-white/10" aria-hidden="true" />
              ) : (
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                  {section}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  return item.enabled ? (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.path === "/"}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `group relative flex items-center rounded-xl py-2.5 text-sm transition-all duration-200 ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                        } ${isActive
                          ? "bg-white/[0.12] font-semibold text-white ring-1 ring-inset ring-white/15"
                          : "font-medium text-white/65 hover:bg-white/[0.07] hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-r-full bg-gold-400 transition-all duration-200 ${isActive ? "h-6" : "h-0 group-hover:h-3"
                              }`}
                            aria-hidden="true"
                          />
                          <Icon
                            className={`h-[17px] w-[17px] shrink-0 transition-colors ${isActive ? "text-gold-300" : "text-white/55 group-hover:text-white/85"
                              }`}
                            aria-hidden="true"
                          />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  ) : (
                    <div
                      key={item.id}
                      aria-disabled="true"
                      title="Coming soon"
                      className={`flex cursor-not-allowed items-center rounded-xl py-2.5 text-sm font-medium text-white/30 ${isCollapsed ? "justify-center px-0" : "justify-between gap-3 px-3"
                        }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon className="h-[17px] w-[17px] shrink-0" aria-hidden="true" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {!isCollapsed && (
                        <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold-300/80">
                          Soon
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer note — hidden on the icon rail, where there is no room for prose */}
      {!isCollapsed && (
        <div className="m-3 rounded-xl bg-white/[0.06] p-3 ring-1 ring-inset ring-white/10">
          <p className="text-[10px] leading-snug text-white/45">
            Illustrative quarry records. Official rates &amp; boundaries are cited in-app.
          </p>
        </div>
      )}
    </div>
  );
}
