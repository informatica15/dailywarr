import { createFileRoute, Link } from "@tanstack/react-router";
import { useGame } from "@/lib/game/store";
import { bestStreak, isDone, levelInfo, streak, todayKey, totalXp } from "@/lib/game/rules";
import { Empty, Panel, QuestCard, XpBar } from "@/components/game/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Habit Quest RPG" },
      { name: "description", content: "Your hero's level, XP and today's quests at a glance." },
      { property: "og:title", content: "Dashboard — Habit Quest RPG" },
      { property: "og:description", content: "Your hero's level, XP and today's quests at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, toggle } = useGame();
  const xp = totalXp(state);
  const lv = levelInfo(xp);
  const today = todayKey();
  const done = state.quests.filter((q) => isDone(state, q.id, today)).length;
  const total = state.quests.length;
  const todayXp = state.quests.filter((q) => isDone(state, q.id, today)).reduce((a, q) => a + q.xp, 0);

  return (
    <div className="space-y-6">
      <Panel className="bg-gradient-to-br from-card to-accent/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-primary bg-secondary text-4xl shadow-glow">{state.avatar}</div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-[0.3em] text-accent">Level {lv.level}</div>
            <h1 className="font-display text-3xl text-primary">{state.playerName}</h1>
            <XpBar pct={lv.pct} className="mt-3" />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>{lv.into} / {lv.needed} XP to level {lv.level + 1}</span><span>{xp} total XP</span></div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Today" value={`${done}/${total}`} />
        <Stat label="XP today" value={`${todayXp}`} />
        <Stat label="Streak" value={`${streak(state)}🔥`} />
        <Stat label="Best streak" value={`${bestStreak(state)}`} />
      </div>

      <Panel title="Today's Quests">
        {total === 0 ? (
          <Empty>No quests yet. <Link to="/quests" className="text-primary underline">Forge your first quest</Link>.</Empty>
        ) : (
          <>
            <XpBar pct={(done / total) * 100} className="h-2 mb-4" />
            <div className="space-y-2">{state.quests.map((q) => <QuestCard key={q.id} quest={q} done={isDone(state, q.id, today)} onToggle={() => toggle(q.id)} />)}</div>
            {done === total && <p className="mt-4 text-center text-primary">All quests conquered today! ⚔️</p>}
          </>
        )}
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-2xl text-foreground mt-1">{value}</div>
    </div>
  );
}
