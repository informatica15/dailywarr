import { Sparkles } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { titleFor } from "@/lib/game/rules";

export function LevelUpOverlay() {
  const { levelUp, dismissLevelUp } = useGame();
  if (!levelUp) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Level up" className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative mx-4 max-w-sm overflow-hidden rounded-3xl border border-primary/40 bg-hero p-10 text-center shadow-glow animate-in zoom-in-90 duration-300">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/15 shadow-glow animate-pulse-glow"><Sparkles className="h-8 w-8 text-primary" /></div>
        <div className="text-sm text-magic">You ascended</div>
        <div className="tnum my-1 font-display text-5xl font-bold">Level {levelUp}</div>
        <div className="mb-6 text-muted-foreground">New title: <span className="text-foreground">{titleFor(levelUp)}</span></div>
        <button onClick={dismissLevelUp} autoFocus className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Continue</button>
      </div>
    </div>
  );
}
