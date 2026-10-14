import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useGame } from "@/lib/game/store";
import { CATEGORIES, isDone, todayKey, type Category } from "@/lib/game/rules";
import { Empty, Panel, QuestCard } from "@/components/game/ui";

export const Route = createFileRoute("/quests")({
  head: () => ({
    meta: [
      { title: "Quests — Habit Quest RPG" },
      { name: "description", content: "Create and manage your daily habit quests." },
      { property: "og:title", content: "Quests — Habit Quest RPG" },
      { property: "og:description", content: "Create and manage your daily habit quests." },
    ],
  }),
  component: Quests,
});

function Quests() {
  const { state, addQuest, deleteQuest, toggle } = useGame();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Health");
  const [xp, setXp] = useState(20);
  const valid = title.trim().length > 0 && xp >= 1 && xp <= 500;
  const today = todayKey();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    addQuest(title, category, Math.round(xp));
    setTitle("");
  };

  const field = "w-full rounded-md border border-input bg-secondary px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-primary">Quest Board</h1>
      <Panel title="Forge a new quest">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_160px_110px_auto] sm:items-end">
          <label className="text-sm">Title<input className={field} value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Drink 8 glasses of water" /></label>
          <label className="text-sm">Category
            <select className={field} value={category} onChange={(e) => setCategory(e.target.value as Category)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="text-sm">XP<input type="number" min={1} max={500} className={field} value={xp} onChange={(e) => setXp(Number(e.target.value))} /></label>
          <button type="submit" disabled={!valid} className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Add quest</button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">All quests repeat daily. XP is earned once per day per quest.</p>
      </Panel>
      <Panel title={`Active quests (${state.quests.length})`}>
        {state.quests.length === 0 ? <Empty>Your quest board is empty. Add a habit above to begin.</Empty> : (
          <div className="space-y-2">
            {state.quests.map((q) => (
              <QuestCard key={q.id} quest={q} done={isDone(state, q.id, today)} onToggle={() => toggle(q.id)}
                onDelete={() => { if (confirm(`Delete "${q.title}"? Its XP history will be removed.`)) deleteQuest(q.id); }} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
