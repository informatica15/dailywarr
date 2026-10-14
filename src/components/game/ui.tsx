import { Check, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Quest } from "@/lib/game/rules";

export function XpBar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-muted", className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5", className)}>
      {title && <h2 className="font-display text-lg text-primary mb-3">{title}</h2>}
      {children}
    </section>
  );
}

export function QuestCard({ quest, done, onToggle, onDelete }: { quest: Quest; done: boolean; onToggle: () => void; onDelete?: () => void }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3 transition-colors", done ? "border-primary/40 bg-primary/10" : "border-border bg-secondary")}>
      <button onClick={onToggle} aria-pressed={done} aria-label={done ? `Mark ${quest.title} incomplete` : `Complete ${quest.title}`}
        className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-all", done ? "border-primary bg-primary text-primary-foreground scale-105" : "border-muted-foreground/50 hover:border-primary")}>
        {done && <Check className="h-5 w-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className={cn("font-medium truncate", done && "line-through text-muted-foreground")}>{quest.title}</div>
        <div className="text-xs text-muted-foreground">{quest.category} · Daily</div>
      </div>
      <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent">+{quest.xp} XP</span>
      {onDelete && (
        <button onClick={onDelete} aria-label={`Delete ${quest.title}`} className="rounded-md p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
      )}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">{children}</div>;
}
