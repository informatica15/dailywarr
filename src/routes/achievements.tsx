import { createFileRoute } from "@tanstack/react-router";
import { useGame } from "@/lib/game/store";
import { ACHIEVEMENTS } from "@/lib/game/rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — Habit Quest RPG" },
      { name: "description", content: "Badges earned on your habit-building journey." },
      { property: "og:title", content: "Achievements — Habit Quest RPG" },
      { property: "og:description", content: "Badges earned on your habit-building journey." },
    ],
  }),
  component: Achievements,
});

function Achievements() {
  const { state } = useGame();
  const earned = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-primary">Hall of Honors</h1>
        <p className="text-muted-foreground">{earned} of {ACHIEVEMENTS.length} earned</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const date = state.achievements[a.id];
          return (
            <div key={a.id} className={cn("flex items-center gap-4 rounded-xl border p-4", date ? "border-primary/50 bg-primary/10" : "border-border bg-card opacity-60")}>
              <div className={cn("text-4xl", !date && "grayscale")}>{date ? a.icon : "🔒"}</div>
              <div className="flex-1">
                <div className="font-semibold">{a.title}</div>
                <div className="text-sm text-muted-foreground">{a.description}</div>
                <div className="text-xs mt-1 text-accent">{date ? `Earned ${date} · +${a.reward} XP` : `Locked · +${a.reward} XP`}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
