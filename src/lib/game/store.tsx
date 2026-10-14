import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ACHIEVEMENTS, applyAchievements, claimBrainSession, initialState, levelInfo, newId, sanitize, seedIfNeeded, todayKey, toggleQuest, totalXp,
  type ClaimResult, type GameId, type GameState, type Quest, type Settings,
} from "./rules";
import { playSfx, setMusicVolume, startMusic, stopMusic } from "../sound";

// Same key as v1 so existing progress is migrated in place, never reset.
const KEY = "habit-quest-rpg:v1";

export type QuestInput = Pick<Quest, "title" | "description" | "category" | "xp" | "difficulty">;

interface Ctx {
  state: GameState;
  loaded: boolean;
  saveError: boolean;
  levelUp: number | null;
  dismissLevelUp: () => void;
  addQuest: (q: QuestInput) => void;
  updateQuest: (id: string, q: Partial<QuestInput> & { status?: Quest["status"] }) => void;
  deleteQuest: (id: string) => void;
  toggle: (id: string) => void;
  setProfile: (p: { name: string; avatar: string; specialization: string }) => void;
  setSettings: (p: Partial<Settings>) => void;
  claimBrain: (sessionId: string, game: GameId, score: number, extra?: { patternSolved?: number }) => ClaimResult;
  sfx: (name: Parameters<typeof playSfx>[0]) => void;
  musicError: boolean;
  reset: () => void;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [musicError, setMusicError] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const prev = useRef<GameState | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let s: GameState;
    try {
      const raw = localStorage.getItem(KEY);
      s = raw ? sanitize(JSON.parse(raw)) : initialState();
    } catch {
      s = initialState();
    }
    setState(seedIfNeeded(s));
    setLoaded(true);
  }, []);

  const sfx = useCallback((name: Parameters<typeof playSfx>[0]) => {
    const st = stateRef.current.settings;
    playSfx(name, st.sfx, st.sfxVolume);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); setSaveError(false); } catch { setSaveError(true); }
    const p = prev.current;
    if (p) {
      const after = levelInfo(totalXp(state)).level;
      if (after > levelInfo(totalXp(p)).level) { setLevelUp(after); sfx("levelup"); }
      for (const a of ACHIEVEMENTS) {
        if (state.achievements[a.id] && !p.achievements[a.id]) {
          toast.success(`Flame unlocked: ${a.title}`, { description: `${a.tier} · +${a.reward} XP` });
          sfx("achievement");
        }
      }
    }
    prev.current = state;
  }, [state, loaded, sfx]);

  // Music only responds to explicit user changes (never auto-starts on load).
  const musicOn = useRef(false);
  const setSettings = useCallback((p: Partial<Settings>) => {
    setState((s) => {
      const settings = { ...s.settings, ...p };
      if (p.music === true || (p.musicVolume !== undefined && settings.music)) {
        const ok = startMusic(settings.musicVolume);
        musicOn.current = ok; setMusicError(!ok);
        if (!ok) settings.music = false;
      }
      if (p.music === false) { stopMusic(); musicOn.current = false; }
      if (p.musicVolume !== undefined && musicOn.current) setMusicVolume(settings.musicVolume);
      return { ...s, settings };
    });
  }, []);

  // A remembered "music on" preference resumes on the first user gesture (autoplay rules).
  useEffect(() => {
    if (!loaded || !state.settings.music || musicOn.current) return;
    const resume = () => { if (stateRef.current.settings.music && !musicOn.current) musicOn.current = startMusic(stateRef.current.settings.musicVolume); };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => { window.removeEventListener("pointerdown", resume); window.removeEventListener("keydown", resume); };
  }, [loaded, state.settings.music]);

  const addQuest = useCallback((q: QuestInput) => {
    setState((s) => ({ ...s, quests: [...s.quests, { ...q, title: q.title.trim(), description: q.description.trim(), id: newId(), recurrence: "daily", status: "active", starter: false, createdAt: todayKey() }] }));
  }, []);
  // Editing XP affects only future completions; past awarded XP is stored per occurrence.
  const updateQuest = useCallback((id: string, q: Partial<QuestInput> & { status?: Quest["status"] }) => {
    setState((s) => ({ ...s, quests: s.quests.map((x) => (x.id === id ? { ...x, ...q, starter: q.title && q.title !== x.title ? false : x.starter } : x)) }));
  }, []);
  const deleteQuest = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      quests: s.quests.filter((q) => q.id !== id),
      completions: Object.fromEntries(Object.entries(s.completions).filter(([k]) => !k.startsWith(id + "|"))),
    }));
  }, []);
  const toggle = useCallback((id: string) => {
    const was = stateRef.current.completions[`${id}|${todayKey()}`] !== undefined;
    sfx(was ? "uncomplete" : "complete");
    setState((s) => toggleQuest(s, id, todayKey()));
  }, [sfx]);
  const setProfile = useCallback((p: { name: string; avatar: string; specialization: string }) =>
    setState((s) => applyAchievements({ ...s, playerName: p.name.trim() || "Wayfarer", avatar: p.avatar, specialization: p.specialization })), []);
  const claimBrain = useCallback((sessionId: string, game: GameId, score: number, extra?: { patternSolved?: number }) => {
    const { state: next, result } = claimBrainSession(stateRef.current, sessionId, game, score, extra);
    if (result.ok) { stateRef.current = next; setState(next); }
    return result;
  }, []);
  const reset = useCallback(() => {
    stopMusic(); musicOn.current = false; prev.current = null;
    setState({ ...seedIfNeeded(initialState()), settings: stateRef.current.settings, });
  }, []);

  return (
    <GameCtx.Provider value={{ state, loaded, saveError, levelUp, dismissLevelUp: () => setLevelUp(null), addQuest, updateQuest, deleteQuest, toggle, setProfile, setSettings, claimBrain, sfx, musicError, reset }}>
      {children}
    </GameCtx.Provider>
  );
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error("useGame outside GameProvider");
  return c;
}

export const useMotionOk = () => {
  const { state } = useGame();
  return !state.settings.reducedMotion;
};
