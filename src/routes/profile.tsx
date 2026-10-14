import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Flame, RotateCcw } from "lucide-react";
import { useGame } from "@/lib/game/store";
import { ACHIEVEMENTS, AVATARS, SPECIALIZATIONS, XP_CONFIG, bestStreak, levelInfo, streak, titleFor, totalXp } from "@/lib/game/rules";
import { PageHeader, Panel, XpBar, btnGhost, btnPrimary, fieldCls } from "@/components/game/ui";
import { Avatar, AVATAR_META } from "@/components/game/Avatar";
import { SoundSettings } from "@/components/game/SoundControl";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ASCEND" },
      { name: "description", content: "Customize your character, sound and display settings in ASCEND." },
      { property: "og:title", content: "Profile — ASCEND" },
      { property: "og:description", content: "Customize your character, sound and display settings." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { state, loaded, setProfile, setSettings, reset } = useGame();
  const [name, setName] = useState(state.playerName);
  const [avatar, setAvatar] = useState(state.avatar);
  const [spec, setSpec] = useState(state.specialization);
  useEffect(() => { setName(state.playerName); setAvatar(state.avatar); setSpec(state.specialization); }, [loaded, state.playerName, state.avatar, state.specialization]);
  const xp = totalXp(state);
  const lv = levelInfo(xp);
  const earned = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter a name."); return; }
    setProfile({ name, avatar, specialization: spec });
    toast.success("Profile saved");
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `ascend-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <PageHeader eyebrow="Character" title="Profile" />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-hero p-6 text-center shadow-card">
          <Avatar id={avatar} size="lg" className="mx-auto" />
          <div className="mt-4 font-display text-2xl font-bold">{state.playerName}</div>
          <div className="tnum text-sm text-primary">Level {lv.level} — {titleFor(lv.level)}</div>
          <div className="text-sm text-magic">{state.specialization}</div>
          <XpBar pct={lv.pct} className="mt-4" label="XP to next level" />
          <div className="tnum mt-1 text-xs text-muted-foreground">{xp.toLocaleString()} lifetime XP</div>
          <div className="tnum mt-5 grid grid-cols-3 gap-2 text-sm">
            <Mini label="Streak" value={streak(state)} />
            <Mini label="Best" value={bestStreak(state)} />
            <Mini label="Flames" value={`${earned}/${ACHIEVEMENTS.length}`} />
          </div>
          <Link to="/hall-of-flames" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"><Flame className="h-4 w-4" /> View Hall of Flames</Link>
        </section>

        <div className="space-y-6">
          <Panel title="Identity">
            <form onSubmit={save} className="space-y-5">
              <label className="block space-y-1.5 text-sm"><span>Name</span>
                <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className={fieldCls} />
              </label>
              <fieldset><legend className="mb-2 text-sm">Avatar</legend>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((a) => (
                    <button type="button" key={a} onClick={() => setAvatar(a)} aria-pressed={avatar === a} aria-label={`Avatar ${AVATAR_META[a]?.label}`}
                      className={cn("rounded-2xl p-0.5 ring-2 transition", avatar === a ? "ring-primary" : "ring-transparent hover:ring-magic/50")}>
                      <Avatar id={a} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset><legend className="mb-2 text-sm">Specialization</legend>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((s) => (
                    <button type="button" key={s} onClick={() => setSpec(s)} aria-pressed={spec === s}
                      className={cn("rounded-full border px-3.5 py-1.5 text-sm transition", spec === s ? "border-magic bg-magic/15" : "border-border text-muted-foreground hover:border-magic/40")}>{s}</button>
                  ))}
                </div>
              </fieldset>
              <button type="submit" className={btnPrimary}>Save profile</button>
            </form>
          </Panel>

          <div id="settings" className="grid gap-6 md:grid-cols-2">
            <Panel title="Sound"><SoundSettings /></Panel>
            <Panel title="Display">
              <div className="space-y-4 text-sm">
                <label className="flex items-center justify-between gap-3">Ambient effects<Switch checked={state.settings.ambient} onCheckedChange={(v) => setSettings({ ambient: v })} /></label>
                <label className="flex items-center justify-between gap-3">Reduce motion<Switch checked={state.settings.reducedMotion} onCheckedChange={(v) => setSettings({ reducedMotion: v })} /></label>
                <p className="text-xs text-muted-foreground">Your device's reduced-motion preference is always respected.</p>
              </div>
            </Panel>
          </div>

          <Panel title="Data">
            <p className="mb-4 text-sm text-muted-foreground">Progress is saved only in this browser. Level 1 needs {XP_CONFIG.base} XP; each level needs {Math.round((XP_CONFIG.growth - 1) * 100)}% more.</p>
            <div className="flex flex-wrap gap-2">
              <button className={btnGhost} onClick={exportData}><Download className="h-4 w-4" /> Export data</button>
              <button className={cn(btnGhost, "text-destructive hover:border-destructive/60")} onClick={() => { if (confirm("Erase all quests, XP and achievements? This cannot be undone.")) { reset(); toast("Progress reset"); } }}>
                <RotateCcw className="h-4 w-4" /> Reset progress
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl bg-raised/60 p-2"><div className="font-display text-lg font-semibold">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>;
}
