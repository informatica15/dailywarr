import { useGame } from "@/lib/game/store";

export function LevelUpOverlay() {
  const { levelUp, dismissLevelUp } = useGame();
  if (!levelUp) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Level up" className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="rounded-2xl border border-primary/50 bg-card p-8 text-center shadow-glow animate-in zoom-in-90 duration-300 max-w-sm mx-4">
        <div className="text-5xl mb-2">✨</div>
        <div className="text-xs uppercase tracking-[0.3em] text-accent">Level up</div>
        <div className="font-display text-5xl text-primary my-2">Level {levelUp}</div>
        <p className="text-muted-foreground mb-6">Your discipline grows stronger, hero.</p>
        <button onClick={dismissLevelUp} autoFocus className="rounded-md bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90">Onward</button>
      </div>
    </div>
  );
}
