import { useMemo } from "react";
import { useGame } from "@/lib/game/store";

/** Fixed atmospheric layer: nebula haze, edge light, vignette, sparse embers. Pure CSS. */
export function Ambient() {
  const { state } = useGame();
  const on = state.settings.ambient;
  const animate = on && !state.settings.reducedMotion;
  // Deterministic positions (no Math.random at render → no hydration mismatch).
  const embers = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    left: `${(i * 37 + 7) % 100}%`, delay: `${(i * 2.3) % 18}s`, dur: `${18 + ((i * 5) % 14)}s`, size: 2 + (i % 3),
  })), []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 50% -10%, color-mix(in oklab, var(--magic) 14%, transparent), transparent 70%), linear-gradient(180deg, var(--surface), var(--background) 60%)" }} />
      {on && (
        <>
          <div className={animate ? "absolute -left-1/4 -top-1/4 h-[70vh] w-[70vw] rounded-full blur-3xl animate-drift" : "absolute -left-1/4 -top-1/4 h-[70vh] w-[70vw] rounded-full blur-3xl"}
            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--magic) 22%, transparent), transparent)" }} />
          <div className={animate ? "absolute -bottom-1/4 -right-1/4 h-[60vh] w-[60vw] rounded-full blur-3xl animate-drift [animation-delay:-12s]" : "absolute -bottom-1/4 -right-1/4 h-[60vh] w-[60vw] rounded-full blur-3xl"}
            style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 12%, transparent), transparent)" }} />
          {animate && embers.map((e, i) => (
            <span key={i} className="absolute bottom-0 rounded-full bg-primary animate-rise" style={{ left: e.left, width: e.size, height: e.size, animationDelay: e.delay, animationDuration: e.dur, boxShadow: "0 0 8px var(--primary)" }} />
          ))}
        </>
      )}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, oklch(0 0 0 / 55%))" }} />
    </div>
  );
}
