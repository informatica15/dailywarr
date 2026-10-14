import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ACHIEVEMENTS, applyAchievements, initialState, levelInfo, newId, sanitize, todayKey, toggleQuest, totalXp,
  type Category, type GameState,
} from "./rules";

const KEY = "habit-quest-rpg:v1";

interface Ctx {
  state: GameState;
  loaded: boolean;
  saveError: boolean;
  levelUp: number | null;
  dismissLevelUp: () => void;
  addQuest: (title: string, category: Category, xp: number) => void;
  deleteQuest: (id: string) => void;
  toggle: (id: string) => void;
  setProfile: (name: string, avatar: string) => void;
  reset: () => void;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const prev = useRef<GameState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(sanitize(JSON.parse(raw)));
    } catch {
      setState(initialState());
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
    const p = prev.current;
    if (p) {
      const before = levelInfo(totalXp(p)).level;
      const after = levelInfo(totalXp(state)).level;
      if (after > before) setLevelUp(after);
      for (const a of ACHIEVEMENTS) {
        if (state.achievements[a.id] && !p.achievements[a.id]) toast.success(`${a.icon} Achievement unlocked: ${a.title}`, { description: `+${a.reward} bonus XP` });
      }
    }
    prev.current = state;
  }, [state, loaded]);

  const addQuest = useCallback((title: string, category: Category, xp: number) => {
    setState((s) => ({ ...s, quests: [...s.quests, { id: newId(), title: title.trim(), category, xp, recurrence: "daily", createdAt: todayKey() }] }));
  }, []);
  const deleteQuest = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      quests: s.quests.filter((q) => q.id !== id),
      completions: Object.fromEntries(Object.entries(s.completions).filter(([k]) => !k.startsWith(id + "|"))),
    }));
  }, []);
  const toggle = useCallback((id: string) => setState((s) => toggleQuest(s, id, todayKey())), []);
  const setProfile = useCallback((name: string, avatar: string) => setState((s) => applyAchievements({ ...s, playerName: name.trim() || "Adventurer", avatar })), []);
  const reset = useCallback(() => { prev.current = null; setState(initialState()); }, []);

  return (
    <GameCtx.Provider value={{ state, loaded, saveError, levelUp, dismissLevelUp: () => setLevelUp(null), addQuest, deleteQuest, toggle, setProfile, reset }}>
      {children}
    </GameCtx.Provider>
  );
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error("useGame outside GameProvider");
  return c;
}
