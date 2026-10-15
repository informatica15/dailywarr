import { useId } from "react";
import { cn } from "@/lib/utils";

/** THE DAILY WAR emblem: a peak with a spark at its base. */
export function Emblem({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--magic)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <path d="M5 26 L16 5 L27 26 L21.5 26 L16 15.5 L10.5 26 Z" fill={`url(#${id})`} />
      <circle cx="16" cy="22" r="2.3" fill="var(--primary)" />
    </svg>
  );
}

export function Wordmark({ className, tagline }: { className?: string; tagline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Emblem />
      <div>
        <div className="font-display text-xl font-bold tracking-[0.12em] whitespace-nowrap text-foreground">THE DAILY WAR</div>
        {tagline && <div className="text-[11px] leading-tight text-muted-foreground">Win the Day. Become Stronger.</div>}
      </div>
    </div>
  );
}
