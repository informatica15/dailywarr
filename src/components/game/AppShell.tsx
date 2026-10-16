import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Brain, Cloud, CloudAlert, CloudOff, Flame, LayoutDashboard, ScrollText, Settings, User } from "lucide-react";
import { useEffect } from "react";
import { useGame } from "@/lib/game/store";
import { levelInfo, titleFor, totalXp } from "@/lib/game/rules";
import { LevelUpOverlay } from "./LevelUpOverlay";
import { Ambient } from "./Ambient";
import { Wordmark } from "./Brand";
import { Avatar } from "./Avatar";
import { SoundControl } from "./SoundControl";
import { XpBar } from "./ui";

const NAV = [
  { to: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/quests", label: "Quests", short: "Quests", icon: ScrollText },
  { to: "/arena", label: "Brain Arena", short: "Arena", icon: Brain },
  { to: "/hall-of-flames", label: "Hall of Flames", short: "Flames", icon: Flame },
  { to: "/profile", label: "Profile", short: "Profile", icon: User },
] as const;

export function AppShell() {
  const { state, saveError } = useGame();
  const lv = levelInfo(totalXp(state));
  const { pathname } = useLocation();
  const reduce = state.settings.reducedMotion;
  useEffect(() => { document.documentElement.classList.toggle("reduce-motion", reduce); }, [reduce]);

  return (
    <div className="relative min-h-screen text-foreground md:flex">
      <Ambient />
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 backdrop-blur-xl md:flex">
        <Link to="/" className="mb-8 px-2 pt-2"><Wordmark tagline /></Link>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
              className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-raised/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              activeProps={{ className: "bg-raised text-foreground font-medium [&>span]:opacity-100 [&>svg]:text-primary" }}>
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary opacity-0 shadow-glow transition-opacity" />
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <Link to="/profile" className="block rounded-xl border border-border bg-card/70 p-3 hover:border-primary/40">
            <div className="flex items-center gap-3">
              <Avatar id={state.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{state.playerName}</div>
                <div className="tnum text-xs text-muted-foreground">Lv {lv.level} · {titleFor(lv.level)}</div>
              </div>
            </div>
            <XpBar pct={lv.pct} className="mt-3 h-1.5" />
          </Link>
          <AccountChip />
          <div className="flex items-center justify-between">
            <SoundControl />
            <Link to="/profile" hash="settings" aria-label="Settings" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-raised hover:text-foreground"><Settings className="h-4 w-4" /></Link>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/70 px-4 py-2.5 backdrop-blur-xl md:hidden">
        <Wordmark />
        <div className="flex items-center gap-1"><AccountChip compact /><SoundControl compact /></div>
      </header>

      <main className="relative flex-1 pb-28 md:pb-10">
        {saveError && <div role="alert" className="bg-destructive px-4 py-2 text-sm text-destructive-foreground">Progress could not be saved in this browser. Changes will be lost on refresh.</div>}
        <div key={pathname} className="mx-auto max-w-6xl animate-page p-4 md:p-8 lg:p-10"><Outlet /></div>
      </main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        {NAV.map(({ to, short, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground"
            activeProps={{ className: "text-primary [&>svg]:drop-shadow-[0_0_6px_var(--primary)]" }}>
            <Icon className="h-5 w-5" /> {short}
          </Link>
        ))}
      </nav>
      <LevelUpOverlay />
    </div>
  );
}

function AccountChip({ compact }: { compact?: boolean }) {
  const { user, sync } = useGame();
  const Icon = !user ? CloudOff : sync === "error" ? CloudAlert : Cloud;
  const label = !user ? "Sign in to save" : sync === "error" ? "Save failed" : sync === "syncing" ? "Saving…" : "Saved to account";
  return (
    <Link to="/auth" aria-label={label} title={label}
      className={compact ? "grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-raised hover:text-foreground"
        : "flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-raised hover:text-foreground"}>
      <Icon className={`h-4 w-4 ${user && sync !== "error" ? "text-primary" : ""}`} />{!compact && label}
    </Link>
  );
}
