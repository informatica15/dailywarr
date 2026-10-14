import { useEffect, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORIES, DIFFICULTIES, type Category, type Difficulty, type Quest } from "@/lib/game/rules";
import type { QuestInput } from "@/lib/game/store";
import { btnGhost, btnPrimary, fieldCls } from "./ui";

export function QuestDialog({ open, onOpenChange, quest, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; quest?: Quest | null; onSave: (q: QuestInput) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Knowledge");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [xp, setXp] = useState(20);
  useEffect(() => {
    if (!open) return;
    setTitle(quest?.title ?? ""); setDescription(quest?.description ?? "");
    setCategory(quest?.category ?? "Knowledge"); setDifficulty(quest?.difficulty ?? "medium"); setXp(quest?.xp ?? 20);
  }, [open, quest]);
  const valid = title.trim().length > 0 && Number.isFinite(xp) && xp >= 1 && xp <= 500;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSave({ title, description, category, difficulty, xp: Math.round(xp) });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{quest ? "Edit quest" : "Create a quest"}</DialogTitle>
          <DialogDescription>Quests repeat daily. XP is earned once per day.{quest && " XP changes apply to future completions."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1.5 text-sm"><span>Title</span>
            <input className={fieldCls} value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Reading Rune" autoFocus />
          </label>
          <label className="block space-y-1.5 text-sm"><span>Description <span className="text-muted-foreground">(optional)</span></span>
            <input className={fieldCls} value={description} maxLength={200} onChange={(e) => setDescription(e.target.value)} placeholder="Read for fifteen minutes" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5 text-sm"><span>Category</span>
              <select className={fieldCls} value={category} onChange={(e) => setCategory(e.target.value as Category)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            </label>
            <label className="block space-y-1.5 text-sm"><span>XP reward</span>
              <input type="number" min={1} max={500} className={fieldCls} value={xp} onChange={(e) => setXp(Number(e.target.value))} />
            </label>
          </div>
          <fieldset className="space-y-1.5 text-sm"><legend className="mb-1.5">Difficulty</legend>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button type="button" key={d} onClick={() => setDifficulty(d)} aria-pressed={difficulty === d}
                  className={`rounded-xl border px-3 py-2 capitalize transition ${difficulty === d ? "border-magic bg-magic/15 text-foreground" : "border-border bg-surface text-muted-foreground hover:border-magic/40"}`}>{d}</button>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnGhost} onClick={() => onOpenChange(false)}>Cancel</button>
            <button type="submit" className={btnPrimary} disabled={!valid}>{quest ? "Save changes" : "Create quest"}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
