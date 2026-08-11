import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "./navConfig";
import { BrandMark } from "../components/ui/BrandMark";

export function Layout() {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Topbar (mobile only) */}
      <header className="flex items-center justify-between border-b border-neutral-border bg-brand-900 px-4 py-3 text-white md:hidden">
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
          className="rounded-md p-1.5 hover:bg-brand-700"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="text-sm font-bold tracking-wide">TN Mining AI Platform</span>
        <BrandMark className="h-5 w-5 text-gold-300" />
      </header>

      {/* Mobile nav overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-neutral-ink/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-50 h-full w-72 max-w-[80vw] overflow-y-auto">
            <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 overflow-y-auto md:block">
        <SidebarContent />
      </aside>

      {/* Desktop topbar + page content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between border-b border-neutral-border bg-neutral-surface px-6 py-3 md:flex">
          <h1 className="text-sm font-semibold text-neutral-ink/70">
            Government of Tamil Nadu <span className="mx-1.5 text-neutral-ink/30">·</span> Department of Geology &amp; Mining
          </h1>
          <span className="rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-brand-900 ring-1 ring-inset ring-gold-300">
            Prototype
          </span>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto bg-gold-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-brand-900 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10">
          <BrandMark className="h-5 w-5 text-gold-300" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">TN Mining AI Platform</p>
          <p className="truncate text-[11px] text-gold-300">Govt. of Tamil Nadu</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return item.enabled ? (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md border-l-4 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-gold-500 bg-white/10 text-white"
                    : "border-transparent text-white/80 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ) : (
            <div
              key={item.id}
              aria-disabled="true"
              className="flex cursor-not-allowed items-center justify-between gap-3 rounded-md border-l-4 border-transparent px-3 py-2.5 text-sm font-medium text-white/40"
              title="Coming soon"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-300">
                Soon
              </span>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3 text-[11px] text-white/50">Prototype build · mock data only</div>
    </div>
  );
}
