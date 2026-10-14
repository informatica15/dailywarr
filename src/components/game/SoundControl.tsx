import { Music, Volume2, VolumeX } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function SoundSettings() {
  const { state, setSettings, musicError, sfx } = useGame();
  const s = state.settings;
  return (
    <div className="space-y-4 text-sm">
      <Row label="Ambient music" icon={<Music className="h-4 w-4 text-magic" />}>
        <Switch checked={s.music} onCheckedChange={(v) => setSettings({ music: v })} aria-label="Ambient music" />
      </Row>
      <Slider value={[Math.round(s.musicVolume * 100)]} max={100} step={5} disabled={!s.music} onValueChange={([v]) => setSettings({ musicVolume: (v ?? 0) / 100 })} aria-label="Music volume" />
      <Row label="Sound effects" icon={<Volume2 className="h-4 w-4 text-primary" />}>
        <Switch checked={s.sfx} onCheckedChange={(v) => setSettings({ sfx: v })} aria-label="Sound effects" />
      </Row>
      <Slider value={[Math.round(s.sfxVolume * 100)]} max={100} step={5} disabled={!s.sfx} onValueChange={([v]) => setSettings({ sfxVolume: (v ?? 0) / 100 })} onValueCommit={() => sfx("correct")} aria-label="Effects volume" />
      {musicError && <p className="text-xs text-destructive">Audio isn't available in this browser. Everything else still works.</p>}
      <p className="text-xs text-muted-foreground">Original synthesized soundtrack. Plays only after you turn it on.</p>
    </div>
  );
}

function Row({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2">{icon}{label}</span>{children}</div>;
}

export function SoundControl({ compact }: { compact?: boolean }) {
  const { state, setSettings } = useGame();
  const muted = !state.settings.music && !state.settings.sfx;
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => setSettings(muted ? { sfx: true } : { music: false, sfx: false })} aria-label={muted ? "Unmute" : "Mute all sound"}
        className={cn("grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", !muted && "text-primary")}>
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <Popover>
        <PopoverTrigger className={cn("rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:bg-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", compact && "px-2")} aria-label="Sound settings">
          {compact ? <Music className="h-4 w-4" /> : "Sound"}
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-72 border-border bg-card"><SoundSettings /></PopoverContent>
      </Popover>
    </div>
  );
}
