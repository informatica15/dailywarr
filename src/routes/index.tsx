import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Pencil, Check, Brain, CheckCircle2, Flame, Plus, ScrollText, Sparkles, Trophy, Zap } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { BRAIN_REWARDS, bestStreak, brainToday, dailyGame, isDone, levelInfo, streak, titleFor, todayKey, totalXp } from "@/lib/game/rules";
import { Empty, Panel, QuestCard, Stat, XpBar, btnGhost, btnPrimary } from "@/components/game/ui";
import { Avatar } from "@/components/game/Avatar";
import { GAME_INFO } from "@/components/brain/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — The Daily War" },
      { name: "description", content: "Your level, XP, streaks and today's quests in The Daily War." },
      { property: "og:title", content: "Dashboard — The Daily War" },
      { property: "og:description", content: "Every quest builds a stronger you." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, toggle, loaded, setProfile } = useGame();
  const [editing, setEditing] = useState<string | null>(null);
  const xp = totalXp(state);
  const lv = levelInfo(xp);
  const today = todayKey();
  const active = state.quests.filter((q) => q.status === "active");
  const doneList = active.filter((q) => isDone(state, q.id, today));
  const todayXp = doneList.reduce((a, q) => a + q.xp, 0) + brainToday(state).xp;
  const game = GAME_INFO[dailyGame()];
  const bt = brainToday(state);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-hero p-6 shadow-card md:p-8">
        <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-magic/20 blur-3xl animate-pulse-glow" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative">
            <div aria-hidden className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl animate-pulse-glow" />
            <Avatar id={state.avatar} size="lg" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Every small victory builds a stronger you.</div>
            {editing === null ? (
              <div className="mt-1 flex items-center gap-2">
                <h1 className="min-w-0 truncate font-display text-3xl font-bold tracking-tight md:text-4xl">{state.playerName}</h1>
                <button onClick={() => setEditing(state.playerName)} aria-label="Edit name" className="rounded-lg p-1.5 text-muted-foreground hover:bg-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Pencil className="h-4 w-4" /></button>
              </div>
            ) : (
              <form className="mt-1 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (editing.trim()) { setProfile({ name: editing, avatar: state.avatar, specialization: state.specialization }); setEditing(null); } }}>
                <input autoFocus aria-label="Your name" value={editing} maxLength={40} onChange={(e) => setEditing(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setEditing(null)} className="min-w-0 flex-1 rounded-xl border border-input bg-surface px-3 py-1.5 font-display text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-ring" />
                <button type="submit" disabled={!editing.trim()} aria-label="Save name" className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-50"><Check className="h-4 w-4" /></button>
              </form>
            )}
            <div className="tnum mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold text-primary">Level {String(lv.level).padStart(2, "0")} — {titleFor(lv.level)}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-magic">{state.specialization}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{xp.toLocaleString()} lifetime XP</span>
            </div>
            <XpBar pct={lv.pct} className="mt-4 h-3" label="XP to next level" />
            <div className="tnum mt-1.5 text-xs text-muted-foreground">{lv.into} / {lv.needed} XP to level {lv.level + 1}</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={CheckCircle2} label="Quests today" value={<>{doneList.length}<span className="text-base text-muted-foreground">/{active.length}</span></>} />
        <Stat icon={Zap} label="XP today" value={todayXp} tone="amber" />
        <Stat icon={Flame} label="Current streak" value={<>{streak(state)}<span className="text-base text-muted-foreground"> days</span></>} tone="amber" />
        <Stat icon={Trophy} label="Best streak" value={<>{bestStreak(state)}<span className="text-base text-muted-foreground"> days</span></>} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] [&>*]:min-w-0">
        <Panel title="Today's Battle" action={<Link to="/quests" className="inline-flex items-center gap-1 text-sm text-magic hover:underline">Quest Board <ArrowRight className="h-3.5 w-3.5" /></Link>}>
          {!loaded ? <div className="h-40 animate-pulse rounded-xl bg-raised/40" /> : active.length === 0 ? (
            <Empty icon={ScrollText} title="No active quests">
              <Link to="/quests" className="mt-3 inline-flex items-center gap-1 text-primary hover:underline"><Plus className="h-4 w-4" /> Create your first quest</Link>
            </Empty>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <XpBar pct={(doneList.length / active.length) * 100} className="h-1.5" label="Today's quest progress" />
                <span className="tnum shrink-0 text-xs text-muted-foreground">{Math.round((doneList.length / active.length) * 100)}%</span>
              </div>
              <div className="space-y-2">{active.map((q) => <QuestCard key={q.id} quest={q} done={isDone(state, q.id, today)} onToggle={() => toggle(q.id)} />)}</div>
              {doneList.length === active.length && <p className="mt-4 flex items-center justify-center gap-2 text-sm text-primary"><Sparkles className="h-4 w-4" /> Every quest conquered today.</p>}
            </>
          )}
        </Panel>

        <section className="relative overflow-hidden rounded-2xl border border-focus/30 bg-card/80 p-6 shadow-card">
          <div aria-hidden className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-focus/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm text-focus"><Brain className="h-4 w-4" /> Daily challenge</div>
            <h2 className="mt-2 font-display text-2xl font-semibold">{game.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{game.tagline}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li className="flex justify-between"><span className="text-muted-foreground">Goal</span><span>Finish one session</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Reward</span><span className="tnum text-primary">+{BRAIN_REWARDS.dailyChallenge + BRAIN_REWARDS.session} XP</span></li>
              <li className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{game.time}</span></li>
            </ul>
            {bt.dailyDone ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-2.5 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> Completed today</div>
            ) : (
              <Link to="/arena" search={{ game: dailyGame() }} className={`${btnPrimary} mt-5 w-full`}>Start challenge</Link>
            )}
            <Link to="/arena" className={`${btnGhost} mt-2 w-full`}>Open Brain Arena</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
