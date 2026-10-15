import { BookOpen, Brain, Check, Code2, Dumbbell, HeartPulse, Home, MessageCircle, Palette, Pause, Pencil, Play, Trash2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Category, Difficulty, Quest } from "@/lib/game/rules";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  Coding: Code2, Mindfulness: Brain, Communication: MessageCircle, Knowledge: BookOpen, Fitness: Dumbbell, Creativity: Palette, Health: HeartPulse, Chores: Home,
};

export function XpBar({ pct, className, label }: { pct: number; className?: string; label?: string }) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-raised", className)} role="progressbar" aria-label={label ?? "Progress"} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-xp shadow-magic transition-[width] duration-700 ease-out" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card/80 p-5 shadow-card backdrop-blur-sm md:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-1 text-sm text-magic">{eyebrow}</div>}
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const DIFF: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };
export function DifficultyPips({ d }: { d: Difficulty }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`Difficulty: ${d}`} aria-label={`Difficulty ${d}`}>
      {[1, 2, 3].map((i) => <span key={i} className={cn("h-1.5 w-3 rounded-full", i <= DIFF[d] ? "bg-magic" : "bg-raised")} />)}
    </span>
  );
}

export function QuestCard({ quest, done, onToggle, onEdit, onDelete, onPause }: {
  quest: Quest; done: boolean; onToggle: () => void; onEdit?: () => void; onDelete?: () => void; onPause?: () => void;
}) {
  const Icon = CATEGORY_ICON[quest.category];
  const paused = quest.status === "paused";
  return (
    <div className={cn(
      "group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 md:p-4",
      done ? "border-primary/30 bg-primary/[0.06]" : paused ? "border-dashed border-border bg-surface/60 opacity-75" : "border-border bg-raised/50 hover:-translate-y-0.5 hover:border-magic/40 hover:bg-raised/80",
    )}>
      <button onClick={onToggle} disabled={paused && !done} aria-pressed={done} aria-label={done ? `Undo ${quest.title}` : `Complete ${quest.title}`}
        className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
          done ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10")}>
        {done ? <Check className="h-5 w-5 animate-pop" strokeWidth={3} /> : <Icon className="h-4 w-4 text-muted-foreground" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("truncate font-medium", done && "text-muted-foreground line-through decoration-primary/50")}>{quest.title}</span>
          {quest.starter && <span className="rounded-md bg-focus/10 px-1.5 py-0.5 text-[10px] font-medium text-focus">Starter</span>}
          {paused && <span className="rounded-md bg-raised px-1.5 py-0.5 text-[10px] text-muted-foreground">Paused</span>}
        </div>
        {quest.description && <div className="truncate text-sm text-muted-foreground">{quest.description}</div>}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Icon className="h-3 w-3" />{quest.category}</span>
          <span className="rounded-md bg-magic/10 px-1.5 py-0.5 text-magic">{quest.tag}</span>
          <span className="tnum">{quest.minutes} min</span>
          <DifficultyPips d={quest.difficulty} />
        </div>
      </div>
      <span className="tnum shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">+{quest.xp} XP</span>
      {(onEdit || onPause || onDelete) && (
        <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
          {onPause && <IconBtn label={paused ? `Resume ${quest.title}` : `Pause ${quest.title}`} onClick={onPause}>{paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</IconBtn>}
          {onEdit && <IconBtn label={`Edit ${quest.title}`} onClick={onEdit}><Pencil className="h-4 w-4" /></IconBtn>}
          {onDelete && <IconBtn label={`Delete ${quest.title}`} onClick={onDelete} danger><Trash2 className="h-4 w-4" /></IconBtn>}
        </div>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, children, danger }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className={cn("rounded-lg p-1.5 text-muted-foreground hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", danger ? "hover:text-destructive" : "hover:text-foreground")}>
      {children}
    </button>
  );
}

export function Empty({ icon: Icon, title, children }: { icon?: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      {Icon && <Icon className="mx-auto mb-3 h-8 w-8 text-magic" />}
      <div className="font-medium">{title}</div>
      {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function Stat({ icon: Icon, label, value, tone = "default" }: { icon: LucideIcon; label: string; value: ReactNode; tone?: "default" | "amber" | "violet" | "cyan" }) {
  const t = { default: "text-foreground", amber: "text-primary", violet: "text-magic", cyan: "text-focus" }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-card transition-colors hover:border-magic/30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className={cn("h-4 w-4", t)} />{label}</div>
      <div className="tnum mt-2 font-display text-2xl font-semibold md:text-3xl">{value}</div>
    </div>
  );
}

export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:shadow-none";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-raised/60 px-4 py-2.5 text-sm font-medium transition hover:bg-raised hover:border-magic/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
export const fieldCls = "w-full rounded-xl border border-input bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring";
