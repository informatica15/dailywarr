import { Crosshair, Shield, Sword, Wand2, Compass, Feather, Flame, Moon, Mountain, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const AVATAR_META: Record<string, { icon: LucideIcon; label: string }> = {
  warrior: { icon: Sword, label: "Warrior" },
  knight: { icon: Shield, label: "Knight" },
  mage: { icon: Wand2, label: "Mage" },
  ranger: { icon: Crosshair, label: "Ranger" },
  flame: { icon: Flame, label: "Flame" },
  spark: { icon: Sparkles, label: "Spark" },
  moon: { icon: Moon, label: "Moon" },
  summit: { icon: Mountain, label: "Summit" },
  feather: { icon: Feather, label: "Feather" },
  compass: { icon: Compass, label: "Compass" },
};

export function Avatar({ id, size = "md", className }: { id: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const Icon = (AVATAR_META[id] ?? AVATAR_META["warrior"]!).icon;
  const s = size === "lg" ? "h-24 w-24" : size === "md" ? "h-12 w-12" : "h-9 w-9";
  const i = size === "lg" ? "h-10 w-10" : size === "md" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className={cn("relative grid shrink-0 place-items-center rounded-2xl border border-primary/30 bg-raised", s, className)}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-magic/30 via-transparent to-primary/25" />
      <Icon className={cn("relative text-primary", i)} strokeWidth={1.75} />
    </div>
  );
}
