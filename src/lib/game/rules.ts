// Pure game rules — no React, no storage.
export const XP_CONFIG = { base: 100, growth: 1.25 };

export const CATEGORIES = ["Health", "Mind", "Craft", "Social", "Chores"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Quest {
  id: string;
  title: string;
  category: Category;
  xp: number;
  recurrence: "daily";
  createdAt: string; // YYYY-MM-DD
}

export interface GameState {
  version: 1;
  playerName: string;
  avatar: string;
  quests: Quest[];
  /** key `${questId}|${date}` -> xp awarded for that occurrence */
  completions: Record<string, number>;
  /** achievement id -> date earned */
  achievements: Record<string, string>;
  bonusXp: number;
}

export const AVATARS = ["🧙", "🗡️", "🛡️", "🏹", "🐉", "🦉"];

export const initialState = (): GameState => ({
  version: 1,
  playerName: "Adventurer",
  avatar: "🧙",
  quests: [],
  completions: {},
  achievements: {},
  bonusXp: 0,
});

export const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const occKey = (questId: string, date: string) => `${questId}|${date}`;

export function xpForLevel(level: number) {
  return Math.round(XP_CONFIG.base * Math.pow(XP_CONFIG.growth, level - 1));
}

export function levelInfo(totalXp: number) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  const needed = xpForLevel(level);
  return { level, into: remaining, needed, pct: (remaining / needed) * 100 };
}

export function totalXp(s: GameState) {
  return Object.values(s.completions).reduce((a, b) => a + b, 0) + s.bonusXp;
}

export function isDone(s: GameState, questId: string, date: string) {
  return occKey(questId, date) in s.completions;
}

export function toggleQuest(s: GameState, questId: string, date: string): GameState {
  const q = s.quests.find((x) => x.id === questId);
  if (!q) return s;
  const key = occKey(questId, date);
  const completions = { ...s.completions };
  // One entry per occurrence: completing twice is impossible; unchecking removes the XP it granted.
  if (key in completions) delete completions[key];
  else completions[key] = q.xp;
  return applyAchievements({ ...s, completions });
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  check: (s: GameState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-quest", title: "First Quest", description: "Complete your first quest.", icon: "🏅", reward: 25, check: (s) => Object.keys(s.completions).length >= 1 },
  { id: "ten-quests", title: "Seasoned Hero", description: "Complete 10 quests.", icon: "⚔️", reward: 50, check: (s) => Object.keys(s.completions).length >= 10 },
  { id: "streak-3", title: "Kindled Flame", description: "Reach a 3-day streak.", icon: "🔥", reward: 50, check: (s) => streak(s) >= 3 },
  { id: "level-5", title: "Rising Legend", description: "Reach level 5.", icon: "👑", reward: 100, check: (s) => levelInfo(totalXp(s)).level >= 5 },
];

/** Achievements are permanent once earned; reward granted exactly once. */
export function applyAchievements(s: GameState): GameState {
  let next = s;
  for (const a of ACHIEVEMENTS) {
    if (!next.achievements[a.id] && a.check(next)) {
      next = {
        ...next,
        achievements: { ...next.achievements, [a.id]: todayKey() },
        bonusXp: next.bonusXp + a.reward,
      };
    }
  }
  return next;
}

export function completedDates(s: GameState) {
  return new Set(Object.keys(s.completions).map((k) => k.split("|")[1]));
}

export function streak(s: GameState, today = new Date()) {
  const dates = completedDates(s);
  const d = new Date(today);
  if (!dates.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dates.has(todayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function bestStreak(s: GameState) {
  const sorted = [...completedDates(s)].sort();
  let best = 0, cur = 0, prev: Date | null = null;
  for (const ds of sorted) {
    const d = new Date(ds + "T00:00:00");
    cur = prev && (d.getTime() - prev.getTime()) / 86400000 === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

/** Validate untrusted stored data; fall back to defaults field by field. */
export function sanitize(raw: unknown): GameState {
  const base = initialState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const quests = Array.isArray(r["quests"])
    ? (r["quests"] as unknown[]).filter((q): q is Quest => {
        const x = q as Quest;
        return !!x && typeof x.id === "string" && typeof x.title === "string" && typeof x.xp === "number" && x.xp > 0 && (CATEGORIES as readonly string[]).includes(x.category);
      }).map((q) => ({ ...q, recurrence: "daily" as const, createdAt: typeof q.createdAt === "string" ? q.createdAt : todayKey() }))
    : [];
  const ids = new Set(quests.map((q) => q.id));
  const completions: Record<string, number> = {};
  if (r["completions"] && typeof r["completions"] === "object") {
    for (const [k, v] of Object.entries(r["completions"] as Record<string, unknown>)) {
      const [qid, date] = k.split("|");
      if (ids.has(qid) && /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") && typeof v === "number" && v > 0) completions[k] = v;
    }
  }
  const achievements: Record<string, string> = {};
  if (r["achievements"] && typeof r["achievements"] === "object") {
    for (const [k, v] of Object.entries(r["achievements"] as Record<string, unknown>)) {
      if (ACHIEVEMENTS.some((a) => a.id === k) && typeof v === "string") achievements[k] = v;
    }
  }
  const bonusXp = ACHIEVEMENTS.filter((a) => achievements[a.id]).reduce((t, a) => t + a.reward, 0);
  return {
    version: 1,
    playerName: typeof r["playerName"] === "string" && r["playerName"].trim() ? r["playerName"].slice(0, 40) : base.playerName,
    avatar: typeof r["avatar"] === "string" && AVATARS.includes(r["avatar"]) ? r["avatar"] : base.avatar,
    quests,
    completions,
    achievements,
    bonusXp,
  };
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
