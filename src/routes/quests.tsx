import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ScrollText } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { CATEGORIES, isDone, todayKey, type Category, type Quest } from "@/lib/game/rules";
import { CATEGORY_ICON, Empty, PageHeader, QuestCard, btnPrimary } from "@/components/game/ui";
import { QuestDialog } from "@/components/game/QuestDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quests")({
  head: () => ({
    meta: [
      { title: "Quest Board — The Daily War" },
      { name: "description", content: "Plan, create and complete your daily quests in The Daily War." },
      { property: "og:title", content: "Quest Board — The Daily War" },
      { property: "og:description", content: "Plan, create and complete your daily quests." },
    ],
  }),
  component: Quests,
});

const TABS = ["Today", "Upcoming", "Completed", "All"] as const;
type Tab = (typeof TABS)[number];

function Quests() {
  const { state, addQuest, updateQuest, deleteQuest, toggle } = useGame();
  const [tab, setTab] = useState<Tab>("Today");
  const [cat, setCat] = useState<Category | "All">("All");
  const [dialog, setDialog] = useState<{ open: boolean; quest: Quest | null }>({ open: false, quest: null });
  const today = todayKey();

  const list = useMemo(() => state.quests.filter((q) => {
    const done = isDone(state, q.id, today);
    if (cat !== "All" && q.category !== cat) return false;
    if (tab === "Today") return q.status === "active";
    if (tab === "Upcoming") return q.status === "active" && !done;
    if (tab === "Completed") return done;
    return true;
  }), [state, tab, cat, today]);

  const counts: Record<Tab, number> = {
    Today: state.quests.filter((q) => q.status === "active").length,
    Upcoming: state.quests.filter((q) => q.status === "active" && !isDone(state, q.id, today)).length,
    Completed: state.quests.filter((q) => isDone(state, q.id, today)).length,
    All: state.quests.length,
  };
  const usedCats = CATEGORIES.filter((c) => state.quests.some((q) => q.category === c));

  return (
    <div>
      <PageHeader eyebrow="Adventure planner" title="Quest Board" description="Shape your days with quests. Each one renews at dawn and grants XP once per day."
        action={<button className={btnPrimary} onClick={() => setDialog({ open: true, quest: null })}><Plus className="h-4 w-4" /> Create quest</button>} />

      <div role="tablist" aria-label="Quest views" className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface/70 p-1">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cn("flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition", tab === t ? "bg-raised font-medium text-foreground shadow-card" : "text-muted-foreground hover:text-foreground")}>
            {t === "Upcoming" ? "Remaining" : t} <span className="tnum ml-1 text-xs text-muted-foreground">{counts[t]}</span>
          </button>
        ))}
      </div>

      {usedCats.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2" aria-label="Filter by category">
          {(["All", ...usedCats] as const).map((c) => {
            const Icon = c === "All" ? null : CATEGORY_ICON[c];
            return (
              <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
                className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition", cat === c ? "border-magic/60 bg-magic/15 text-foreground" : "border-border text-muted-foreground hover:border-magic/40 hover:text-foreground")}>
                {Icon && <Icon className="h-3 w-3" />}{c}
              </button>
            );
          })}
        </div>
      )}

      {list.length === 0 ? (
        <Empty icon={ScrollText} title={state.quests.length === 0 ? "Your quest board is empty" : tab === "Completed" ? "Nothing completed yet today" : tab === "Upcoming" ? "All quests done for today" : "No quests match this view"}>
          {state.quests.length === 0 && <button className={`${btnPrimary} mt-4`} onClick={() => setDialog({ open: true, quest: null })}><Plus className="h-4 w-4" /> Create quest</button>}
        </Empty>
      ) : (
        <div className="space-y-2">
          {list.map((q) => (
            <QuestCard key={q.id} quest={q} done={isDone(state, q.id, today)} onToggle={() => toggle(q.id)}
              onEdit={() => setDialog({ open: true, quest: q })}
              onPause={() => updateQuest(q.id, { status: q.status === "paused" ? "active" : "paused" })}
              onDelete={() => { if (confirm(`Delete "${q.title}"? Its XP history will be removed.`)) deleteQuest(q.id); }} />
          ))}
        </div>
      )}

      <QuestDialog open={dialog.open} quest={dialog.quest} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        onSave={(input) => (dialog.quest ? updateQuest(dialog.quest.id, input) : addQuest(input))} />
    </div>
  );
}
