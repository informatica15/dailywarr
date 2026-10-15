import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Brain } from "lucide-react";
import { BRAIN_REWARDS, GAME_IDS, brainToday, dailyGame, newId, type ClaimResult, type GameId } from "@/lib/game/rules";
import { useGame } from "@/lib/game/store";
import { GAME_INFO } from "@/components/brain/data";
import { LogicGame, MemoryGame, PatternGame, ReactionGame, type Finish } from "@/components/brain/Games";
import { PageHeader, Panel, btnGhost, btnPrimary } from "@/components/game/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arena")({
  validateSearch: (s: Record<string, unknown>): { game?: GameId } =>
    GAME_IDS.includes(s["game"] as GameId) ? { game: s["game"] as GameId } : {},
  head: () => ({
    meta: [
      { title: "Brain Arena — The Daily War" },
      { name: "description", content: "Train your focus with four quick mind games and earn XP." },
      { property: "og:title", content: "Brain Arena — The Daily War" },
      { property: "og:description", content: "Train your focus. Challenge your thinking." },
    ],
  }),
  component: Arena,
});

const UNIT: Record<GameId, string> = { memory: "length", pattern: "/6 correct", logic: "/5 correct", reaction: "ms avg" };
const GAMES = { memory: MemoryGame, pattern: PatternGame, logic: LogicGame, reaction: ReactionGame };

function Arena() {
  const { game } = Route.useSearch();
  const navigate = useNavigate({ from: "/arena" });
  const { state, claimBrain, sfx } = useGame();
  const daily = dailyGame();
  const bt = brainToday(state);
  const [session, setSession] = useState<{ id: string; result?: ClaimResult & { score: number } } | null>(null);

  if (game) {
    const Game = GAMES[game];
    const finish: Finish = (score, extra) => {
      if (!session || session.result) return;
      const r = claimBrain(session.id, game, score, extra);
      if (r.ok) sfx("complete");
      setSession({ ...session, result: { ...r, score } });
    };
    return (
      <div>
        <button className={`${btnGhost} mb-4`} onClick={() => { setSession(null); navigate({ search: {} }); }}><ArrowLeft className="h-4 w-4" /> All games</button>
        <PageHeader eyebrow={game === daily ? "Today's challenge" : "Brain Arena"} title={GAME_INFO[game].name} description={GAME_INFO[game].tagline} />
        <Panel>
          {!session ? (
            <div className="space-y-4 text-center text-sm text-muted-foreground">
              <p>Milestone: {BRAIN_REWARDS.lowerIsBetter[game] ? "≤" : "≥"} {BRAIN_REWARDS.milestones[game]} {UNIT[game]}. Best: {state.brain.best[game] ?? "—"}</p>
              <button className={btnPrimary} onClick={() => setSession({ id: newId() })}>Start</button>
            </div>
          ) : session.result ? (
            <div className="space-y-3 text-center">
              <div className="tnum font-display text-4xl font-bold">{session.result.score} <span className="text-base text-muted-foreground">{UNIT[game]}</span></div>
              {session.result.ok ? (
                <p className="text-sm"><span className="tnum font-semibold text-primary">+{session.result.xp} XP</span>
                  {session.result.milestone && " · milestone reached"}{session.result.daily && " · daily challenge"}{session.result.newBest && " · new best!"}</p>
              ) : null}
              {session.result.reason && <p className="text-sm text-muted-foreground">{session.result.reason}</p>}
              <button className={btnPrimary} onClick={() => setSession({ id: newId() })}>Play again</button>
            </div>
          ) : (
            <Game key={session.id} onFinish={finish} sfx={sfx} />
          )}
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Brain Arena" title="Brain Arena" description="Train your focus. Challenge your thinking." />
      <p className="tnum mb-4 text-sm text-muted-foreground">Arena XP today: {bt.xp}/{BRAIN_REWARDS.dailyCap} · {BRAIN_REWARDS.session} XP per session, +{BRAIN_REWARDS.milestone} for a milestone, +{BRAIN_REWARDS.dailyChallenge} for today's challenge.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {GAME_IDS.map((g) => (
          <button key={g} onClick={() => { setSession(null); navigate({ search: { game: g } }); }}
            className={cn("rounded-2xl border bg-card/80 p-5 text-left transition hover:border-magic/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", g === daily ? "border-primary/40" : "border-border")}>
            <div className="flex items-center gap-2 text-sm text-focus"><Brain className="h-4 w-4" />{g === daily ? (bt.dailyDone ? "Today's challenge · done" : "Today's challenge") : "Mini-game"}</div>
            <div className="mt-1 font-display text-lg font-semibold">{GAME_INFO[g].name}</div>
            <p className="text-sm text-muted-foreground">{GAME_INFO[g].tagline}</p>
            <div className="tnum mt-2 text-xs text-muted-foreground">{GAME_INFO[g].time} · Played {state.brain.completed[g] ?? 0}× · Best {state.brain.best[g] ?? "—"}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
