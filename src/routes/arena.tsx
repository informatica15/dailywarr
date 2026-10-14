import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { GAME_IDS, dailyGame, type GameId } from "@/lib/game/rules";
import { GAME_INFO } from "@/components/brain/data";
import { PageHeader } from "@/components/game/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arena")({
  validateSearch: (s: Record<string, unknown>): { game?: GameId } =>
    GAME_IDS.includes(s["game"] as GameId) ? { game: s["game"] as GameId } : {},
  head: () => ({
    meta: [
      { title: "Brain Arena — ASCEND" },
      { name: "description", content: "Train your focus. Challenge your thinking." },
      { property: "og:title", content: "Brain Arena — ASCEND" },
      { property: "og:description", content: "Train your focus. Challenge your thinking." },
    ],
  }),
  component: Arena,
});

function Arena() {
  const daily = dailyGame();
  return (
    <div>
      <PageHeader eyebrow="Brain Arena" title="Brain Arena" description="Train your focus. Challenge your thinking." />
      <div className="mb-4 rounded-xl border border-focus/30 bg-focus/5 p-4 text-sm text-muted-foreground">
        The four mini-games are still being built and can't be played yet. No XP is awarded here yet.
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {GAME_IDS.map((g) => (
          <div key={g} className={cn("rounded-2xl border bg-card/80 p-5", g === daily ? "border-primary/40" : "border-border")}>
            <div className="flex items-center gap-2 text-sm text-focus"><Brain className="h-4 w-4" />{g === daily ? "Today's challenge" : "Mini-game"}</div>
            <div className="mt-1 font-display text-lg font-semibold">{GAME_INFO[g].name}</div>
            <p className="text-sm text-muted-foreground">{GAME_INFO[g].tagline}</p>
            <div className="mt-2 text-xs text-muted-foreground">Coming soon</div>
          </div>
        ))}
      </div>
    </div>
  );
}
