import { createFileRoute } from "@tanstack/react-router";
import { Flame, Lock } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ACHIEVEMENTS, type Tier } from "@/lib/game/rules";
import { PageHeader, XpBar } from "@/components/game/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hall-of-flames")({
  head: () => ({
    meta: [
      { title: "Hall of Flames — The Daily War" },
      { name: "description", content: "Your unlocked and locked achievement flames in The Daily War." },
      { property: "og:title", content: "Hall of Flames — The Daily War" },
      { property: "og:description", content: "Your unlocked and locked achievement flames." },
    ],
  }),
  component: Hall,
});

const TIER: Record<Tier, { ring: string; glow: string; text: string }> = {
  Ember: { ring: "border-primary/30", glow: "bg-primary/15", text: "text-primary" },
  Flame: { ring: "border-primary/50", glow: "bg-primary/25", text: "text-primary" },
  Inferno: { ring: "border-destructive/50", glow: "bg-destructive/20", text: "text-destructive" },
  Legend: { ring: "border-magic/60", glow: "bg-magic/25", text: "text-magic" },
};

function Hall() {
  const { state } = useGame();
  const earned = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;
  const groups = [...new Set(ACHIEVEMENTS.map((a) => a.group))];
  return (
    <div>
      <PageHeader eyebrow="Achievements" title="Hall of Flames" description="Each flame marks a milestone you truly reached." />
      <div className="mb-8 rounded-2xl border border-border bg-card/80 p-5 shadow-card">
        <div className="tnum mb-2 flex justify-between text-sm"><span>{earned} of {ACHIEVEMENTS.length} flames unlocked</span><span className="text-muted-foreground">{Math.round((earned / ACHIEVEMENTS.length) * 100)}%</span></div>
        <XpBar pct={(earned / ACHIEVEMENTS.length) * 100} label="Achievements unlocked" />
      </div>
      {groups.map((g) => (
        <section key={g} className="mb-8">
          <h2 className="mb-3 font-display text-lg font-semibold">{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.filter((a) => a.group === g).map((a) => {
              const date = state.achievements[a.id];
              const t = TIER[a.tier];
              return (
                <div key={a.id} className={cn("relative overflow-hidden rounded-2xl border p-5 transition", date ? `${t.ring} bg-card shadow-card` : "border-border bg-surface/70")}>
                  {date && <div aria-hidden className={cn("absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl animate-pulse-glow", t.glow)} />}
                  <div className="relative flex items-start gap-4">
                    <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl border", date ? `${t.ring} ${t.glow} animate-pop` : "border-dashed border-border bg-raised/40")}>
                      {date ? <Flame className={cn("h-7 w-7", t.text)} /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <div className={cn("text-xs font-medium", date ? t.text : "text-muted-foreground")}>{a.tier}</div>
                      <div className="font-display font-semibold">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{a.description}</div>
                      <div className="tnum mt-2 text-xs">{date ? <span className="text-success">Unlocked {date} · +{a.reward} XP</span> : <span className="text-muted-foreground">Reward +{a.reward} XP</span>}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
