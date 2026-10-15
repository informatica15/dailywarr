import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { btnPrimary } from "@/components/game/ui";

export type Finish = (score: number, extra?: { patternSolved?: number }) => void;
type Sfx = (n: "correct" | "wrong" | "complete") => void;
const rnd = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j]!, b[i]!]; } return b; };

/* ---------- Memory Sequence: score = longest sequence repeated ---------- */
export function MemoryGame({ onFinish, sfx }: { onFinish: Finish; sfx: Sfx }) {
  const [seq, setSeq] = useState<number[]>(() => [rnd(9), rnd(9), rnd(9)]);
  const [lit, setLit] = useState<number | null>(null);
  const [showing, setShowing] = useState(true);
  const [pos, setPos] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    setShowing(true); setPos(0);
    seq.forEach((c, i) => {
      timers.current.push(window.setTimeout(() => setLit(c), 700 + i * 650));
      timers.current.push(window.setTimeout(() => setLit(null), 700 + i * 650 + 420));
    });
    timers.current.push(window.setTimeout(() => setShowing(false), 700 + seq.length * 650));
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [seq]);
  const press = (c: number) => {
    if (showing) return;
    if (c !== seq[pos]) { sfx("wrong"); onFinish(seq.length - 1); return; }
    if (pos + 1 === seq.length) {
      sfx("correct");
      if (seq.length >= 9) onFinish(9); else setSeq([...seq, rnd(9)]);
    } else setPos(pos + 1);
  };
  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-muted-foreground">{showing ? `Watch the sequence (${seq.length})…` : `Your turn: ${pos}/${seq.length}`}</p>
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-3">
        {Array.from({ length: 9 }, (_, i) => (
          <button key={i} onClick={() => press(i)} disabled={showing} aria-label={`Tile ${i + 1}`}
            className={cn("aspect-square rounded-2xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", lit === i ? "border-primary bg-primary shadow-glow" : "border-border bg-raised hover:border-magic/50")} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Pattern Predictor: 6 rounds, score = correct ---------- */
function makePattern() {
  const kind = rnd(3), a = 1 + rnd(9), d = 2 + rnd(6);
  const terms = Array.from({ length: 5 }, (_, i) => kind === 0 ? a + d * i : kind === 1 ? a * Math.pow(2, i) : a + (i * (i + 1)) / 2 * d);
  const answer = terms[4]!;
  const opts = shuffle([...new Set([answer, answer + d, answer - d, answer + 1])]);
  return { shown: terms.slice(0, 4), answer, opts };
}
export function PatternGame({ onFinish, sfx }: { onFinish: Finish; sfx: Sfx }) {
  return <QuizGame rounds={6} make={() => { const p = makePattern(); return { q: `${p.shown.join(", ")}, ?`, answer: String(p.answer), opts: p.opts.map(String) }; }}
    onDone={(c) => onFinish(c, { patternSolved: c })} sfx={sfx} hint="What comes next?" />;
}

/* ---------- Logic Chamber: 5 deduction puzzles ---------- */
const NAMES = ["Aria", "Bram", "Cora", "Dax", "Elin", "Finn"];
function makeLogic() {
  const people = shuffle(NAMES).slice(0, 3); // ordered strongest -> weakest
  const pairs = shuffle([`${people[0]} is stronger than ${people[1]}.`, `${people[1]} is stronger than ${people[2]}.`]);
  const askStrong = Math.random() < 0.5;
  return { q: `${pairs.join(" ")} Who is the ${askStrong ? "strongest" : "weakest"}?`, answer: askStrong ? people[0]! : people[2]!, opts: shuffle(people) };
}
export function LogicGame({ onFinish, sfx }: { onFinish: Finish; sfx: Sfx }) {
  return <QuizGame rounds={5} make={makeLogic} onDone={(c) => onFinish(c)} sfx={sfx} hint="Deduce the answer." />;
}

function QuizGame({ rounds, make, onDone, sfx, hint }: { rounds: number; make: () => { q: string; answer: string; opts: string[] }; onDone: (c: number) => void; sfx: Sfx; hint: string }) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [p, setP] = useState(make);
  const [picked, setPicked] = useState<string | null>(null);
  const pick = (o: string) => {
    if (picked) return;
    setPicked(o);
    const ok = o === p.answer;
    sfx(ok ? "correct" : "wrong");
    const c = correct + (ok ? 1 : 0);
    setCorrect(c);
    window.setTimeout(() => {
      if (round + 1 >= rounds) onDone(c);
      else { setRound(round + 1); setP(make()); setPicked(null); }
    }, 700);
  };
  return (
    <div className="text-center">
      <p className="tnum mb-2 text-sm text-muted-foreground">Round {round + 1}/{rounds} · {correct} correct · {hint}</p>
      <p className="mx-auto mb-5 max-w-md font-display text-xl font-semibold">{p.q}</p>
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-3">
        {p.opts.map((o) => (
          <button key={o} onClick={() => pick(o)} disabled={!!picked}
            className={cn("rounded-xl border px-4 py-3 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              picked && o === p.answer ? "border-success bg-success/15" : picked === o ? "border-destructive bg-destructive/15" : "border-border bg-raised hover:border-magic/50")}>{o}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Reaction Rift: 5 rounds, score = average ms ---------- */
export function ReactionGame({ onFinish, sfx }: { onFinish: Finish; sfx: Sfx }) {
  const [phase, setPhase] = useState<"wait" | "go" | "early">("wait");
  const [times, setTimes] = useState<number[]>([]);
  const start = useRef(0);
  const t = useRef<number>(0);
  useEffect(() => {
    if (phase !== "wait") return;
    t.current = window.setTimeout(() => { start.current = performance.now(); setPhase("go"); }, 1200 + rnd(2000));
    return () => clearTimeout(t.current);
  }, [phase, times.length]);
  const hit = () => {
    if (phase === "early") { setPhase("wait"); return; }
    if (phase === "wait") { clearTimeout(t.current); sfx("wrong"); setPhase("early"); return; }
    const ms = Math.round(performance.now() - start.current);
    sfx("correct");
    const next = [...times, ms];
    if (next.length >= 5) onFinish(Math.round(next.reduce((a, b) => a + b, 0) / next.length));
    else { setTimes(next); setPhase("wait"); }
  };
  return (
    <div className="text-center">
      <p className="tnum mb-4 text-sm text-muted-foreground">Round {times.length + 1}/5 {times.length > 0 && `· last ${times[times.length - 1]} ms`}</p>
      <button onClick={hit} className={cn("mx-auto grid h-56 w-full max-w-sm place-items-center rounded-3xl border text-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        phase === "go" ? "border-primary bg-primary text-primary-foreground shadow-glow" : phase === "early" ? "border-destructive bg-destructive/15" : "border-border bg-raised")}>
        {phase === "go" ? "Strike now!" : phase === "early" ? "Too early — tap to retry" : "Wait for the rift…"}
      </button>
    </div>
  );
}

export function StartCard({ onStart, label }: { onStart: () => void; label: string }) {
  return <div className="text-center"><button className={btnPrimary} onClick={onStart}>{label}</button></div>;
}
