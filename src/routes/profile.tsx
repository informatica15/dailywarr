import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGame } from "@/lib/game/store";
import { AVATARS, XP_CONFIG, levelInfo, totalXp } from "@/lib/game/rules";
import { Panel } from "@/components/game/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Habit Quest RPG" },
      { name: "description", content: "Customize your hero's name and avatar." },
      { property: "og:title", content: "Profile — Habit Quest RPG" },
      { property: "og:description", content: "Customize your hero's name and avatar." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { state, loaded, setProfile, reset } = useGame();
  const [name, setName] = useState(state.playerName);
  const [avatar, setAvatar] = useState(state.avatar);
  useEffect(() => { setName(state.playerName); setAvatar(state.avatar); }, [loaded, state.playerName, state.avatar]);
  const lv = levelInfo(totalXp(state));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-primary">Hero Profile</h1>
      <Panel title="Identity">
        <form onSubmit={(e) => { e.preventDefault(); setProfile(name, avatar); toast.success("Profile saved"); }} className="space-y-4">
          <label className="block text-sm">Name
            <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-secondary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <div className="text-sm">Avatar</div>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button type="button" key={a} onClick={() => setAvatar(a)} aria-pressed={avatar === a} aria-label={`Avatar ${a}`}
                className={cn("h-14 w-14 rounded-full border-2 text-2xl transition-all", avatar === a ? "border-primary bg-primary/15 scale-110" : "border-border bg-secondary hover:border-accent")}>{a}</button>
            ))}
          </div>
          <button type="submit" className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground hover:bg-primary/90">Save profile</button>
        </form>
      </Panel>
      <Panel title="Progression rules">
        <p className="text-sm text-muted-foreground">Level {lv.level}. Level 1 needs {XP_CONFIG.base} XP; each level needs {Math.round((XP_CONFIG.growth - 1) * 100)}% more than the last. Data is stored only in this browser.</p>
      </Panel>
      <Panel title="Danger zone">
        <button onClick={() => { if (confirm("Erase all quests, XP and achievements?")) { reset(); toast("Progress reset"); } }}
          className="rounded-md border border-destructive px-4 py-2 text-destructive hover:bg-destructive/10">Reset all progress</button>
      </Panel>
    </div>
  );
}
