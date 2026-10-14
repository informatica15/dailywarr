import { Link, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, ScrollText, Trophy, User } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { levelInfo, totalXp } from "@/lib/game/rules";
import { LevelUpOverlay } from "./LevelUpOverlay";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/quests", label: "Quests", icon: ScrollText },
  { to: "/achievements", label: "Achievements", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell() {
  const { state, saveError } = useGame();
  const lv = levelInfo(totalXp(state));
  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar p-5 sticky top-0 h-screen">
        <div className="font-display text-2xl text-primary tracking-wide">Habit Quest</div>
        <div className="text-xs uppercase tracking-[0.3em] text-accent mb-8">RPG</div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
              activeProps={{ className: "bg-sidebar-accent text-primary font-semibold" }}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-border bg-card p-3 text-sm">
          <div className="flex items-center gap-2"><span className="text-2xl">{state.avatar}</span><div><div className="font-semibold">{state.playerName}</div><div className="text-muted-foreground text-xs">Level {lv.level}</div></div></div>
        </div>
      </aside>
      <main className="flex-1 pb-24 md:pb-8">
        {saveError && <div role="alert" className="bg-destructive text-destructive-foreground text-sm px-4 py-2">Progress could not be saved in this browser. Changes will be lost on refresh.</div>}
        <div className="mx-auto max-w-5xl p-4 md:p-8"><Outlet /></div>
      </main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-4 border-t border-border bg-sidebar/95 backdrop-blur">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: true }} className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground"
            activeProps={{ className: "text-primary" }}>
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
      </nav>
      <LevelUpOverlay />
    </div>
  );
}
