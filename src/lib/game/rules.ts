// Pure game rules — no React, no storage.
export const XP_CONFIG = { base: 100, growth: 1.25 };

export const CATEGORIES = ["Coding", "Mindfulness", "Communication", "Knowledge", "Fitness", "Creativity", "Health", "Chores"] as const;
export type Category = (typeof CATEGORIES)[number];
const LEGACY_CATEGORY: Record<string, Category> = { Mind: "Mindfulness", Craft: "Creativity", Social: "Communication" };

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: Category;
  xp: number;
  difficulty: Difficulty;
  recurrence: "daily";
  status: "active" | "paused";
  starter: boolean;
  createdAt: string;
}

export const GAME_IDS = ["memory", "pattern", "logic", "reaction"] as const;
export type GameId = (typeof GAME_IDS)[number];

export interface BrainSession { game: GameId; date: string; score: number; xp: number; milestone: boolean; daily: boolean }

export interface Settings {
  music: boolean; musicVolume: number; sfx: boolean; sfxVolume: number; ambient: boolean; reducedMotion: boolean;
}

export interface GameState {
  version: 2;
  playerName: string;
  avatar: string;
  specialization: string;
  seeded: boolean;
  quests: Quest[];
  /** key `${questId}|${date}` -> xp awarded for that occurrence */
  completions: Record<string, number>;
  /** achievement id -> date earned */
  achievements: Record<string, string>;
  brain: {
    best: Partial<Record<GameId, number>>;
    completed: Partial<Record<GameId, number>>;
    patternSolved: number;
    sessions: Record<string, BrainSession>;
  };
  settings: Settings;
}

export const AVATARS = ["flame", "spark", "moon", "summit", "feather", "compass"] as const;
export const SPECIALIZATIONS = ["Scholar", "Warrior", "Sage", "Artisan", "Orator"] as const;

export const defaultSettings = (): Settings => ({ music: false, musicVolume: 0.4, sfx: true, sfxVolume: 0.6, ambient: true, reducedMotion: false });

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const STARTERS: Array<Pick<Quest, "title" | "description" | "category" | "xp" | "difficulty">> = [
  { title: "The Codebreaker", description: "Solve one Python problem.", category: "Coding", xp: 30, difficulty: "hard" },
  { title: "Mindful Momentum", description: "Ten minutes of mindful reflection.", category: "Mindfulness", xp: 15, difficulty: "easy" },
  { title: "Wordsmith", description: "Practice English speaking for ten minutes.", category: "Communication", xp: 20, difficulty: "medium" },
  { title: "The Reading Rune", description: "Read for fifteen minutes.", category: "Knowledge", xp: 20, difficulty: "medium" },
  { title: "Body in Motion", description: "Fifteen minutes of movement.", category: "Fitness", xp: 20, difficulty: "medium" },
  { title: "Creative Spark", description: "Create or sketch one new idea.", category: "Creativity", xp: 15, difficulty: "easy" },
];

export const starterQuests = (): Quest[] =>
  STARTERS.map((s) => ({ ...s, id: newId(), recurrence: "daily", status: "active", starter: true, createdAt: todayKey() }));

export const initialState = (): GameState => ({
  version: 2,
  playerName: "Wayfarer",
  avatar: "flame",
  specialization: "Scholar",
  seeded: false,
  quests: [],
  completions: {},
  achievements: {},
  brain: { best: {}, completed: {}, patternSolved: 0, sessions: {} },
  settings: defaultSettings(),
});

/** Seed starter quests only for a board that has never been seeded and is empty. */
export function seedIfNeeded(s: GameState): GameState {
  if (s.seeded) return s;
  return { ...s, seeded: true, quests: s.quests.length ? s.quests : starterQuests() };
}

export const occKey = (questId: string, date: string) => `${questId}|${date}`;

export function xpForLevel(level: number) {
  return Math.round(XP_CONFIG.base * Math.pow(XP_CONFIG.growth, level - 1));
}

export function levelInfo(totalXp: number) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) { remaining -= xpForLevel(level); level++; }
  const needed = xpForLevel(level);
  return { level, into: remaining, needed, pct: (remaining / needed) * 100 };
}

const TITLES: Array<[number, string]> = [[12, "Ascendant"], [8, "Flamebearer"], [5, "Pathforger"], [3, "Seeker"], [1, "Wayfinder"]];
export const titleFor = (level: number) => TITLES.find(([l]) => level >= l)![1];

export function achievementXp(s: GameState) {
  return ACHIEVEMENTS.filter((a) => s.achievements[a.id]).reduce((t, a) => t + a.reward, 0);
}
export function questXp(s: GameState) { return Object.values(s.completions).reduce((a, b) => a + b, 0); }
export function brainXp(s: GameState) { return Object.values(s.brain.sessions).reduce((a, b) => a + b.xp, 0); }
export function totalXp(s: GameState) { return questXp(s) + achievementXp(s) + brainXp(s); }

export function isDone(s: GameState, questId: string, date: string) { return occKey(questId, date) in s.completions; }

export function toggleQuest(s: GameState, questId: string, date: string): GameState {
  const q = s.quests.find((x) => x.id === questId);
  if (!q) return s;
  const key = occKey(questId, date);
  const completions = { ...s.completions };
  // One entry per occurrence: completing twice is impossible; unchecking removes the XP it granted.
  if (key in completions) delete completions[key];
  else if (q.status === "active") completions[key] = q.xp;
  else return s;
  return applyAchievements({ ...s, completions });
}

export function completedDates(s: GameState) {
  return new Set(Object.keys(s.completions).map((k) => k.split("|")[1]));
}

export function streak(s: GameState, today = new Date()) {
  const dates = completedDates(s);
  const d = new Date(today);
  if (!dates.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dates.has(todayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export function bestStreak(s: GameState) {
  const sorted = [...completedDates(s)].sort();
  let best = 0, cur = 0, prev: Date | null = null;
  for (const ds of sorted) {
    const d = new Date(ds + "T00:00:00");
    cur = prev && Math.round((d.getTime() - prev.getTime()) / 86400000) === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = d;
  }
  return best;
}

export type Tier = "Ember" | "Flame" | "Inferno" | "Ascendant";
export interface Achievement { id: string; title: string; description: string; tier: Tier; reward: number; group: string; check: (s: GameState) => boolean }

const nQ = (s: GameState) => Object.keys(s.completions).length;
const lvl = (s: GameState) => levelInfo(questXp(s) + brainXp(s)).level; // excludes achievement XP to avoid self-reference
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-quest", title: "First Quest", description: "Complete your first quest.", tier: "Ember", reward: 25, group: "Habits", check: (s) => nQ(s) >= 1 },
  { id: "ten-quests", title: "Seasoned Hero", description: "Complete 10 quests.", tier: "Flame", reward: 50, group: "Habits", check: (s) => nQ(s) >= 10 },
  { id: "fifty-quests", title: "Unbroken Will", description: "Complete 50 quests.", tier: "Inferno", reward: 150, group: "Habits", check: (s) => nQ(s) >= 50 },
  { id: "streak-3", title: "Kindled Flame", description: "Reach a 3-day streak.", tier: "Ember", reward: 50, group: "Consistency", check: (s) => bestStreak(s) >= 3 },
  { id: "streak-7", title: "Steady Blaze", description: "Reach a 7-day streak.", tier: "Flame", reward: 100, group: "Consistency", check: (s) => bestStreak(s) >= 7 },
  { id: "streak-30", title: "Eternal Fire", description: "Reach a 30-day streak.", tier: "Ascendant", reward: 300, group: "Consistency", check: (s) => bestStreak(s) >= 30 },
  { id: "level-5", title: "Rising Legend", description: "Reach level 5 through quests and training.", tier: "Flame", reward: 100, group: "Growth", check: (s) => lvl(s) >= 5 },
  { id: "level-10", title: "Living Legend", description: "Reach level 10 through quests and training.", tier: "Inferno", reward: 200, group: "Growth", check: (s) => lvl(s) >= 10 },
  { id: "memory-spark", title: "Memory Spark", description: "Complete a Memory Sequence session.", tier: "Ember", reward: 20, group: "Brain Arena", check: (s) => (s.brain.completed.memory ?? 0) >= 1 },
  { id: "pattern-seeker", title: "Pattern Seeker", description: "Solve five pattern puzzles.", tier: "Ember", reward: 20, group: "Brain Arena", check: (s) => s.brain.patternSolved >= 5 },
  { id: "logic-adept", title: "Logic Adept", description: "Complete a Logic Chamber session.", tier: "Ember", reward: 20, group: "Brain Arena", check: (s) => (s.brain.completed.logic ?? 0) >= 1 },
  { id: "quick-reflex", title: "Quick Reflex", description: "Complete a Reaction Rift session.", tier: "Ember", reward: 20, group: "Brain Arena", check: (s) => (s.brain.completed.reaction ?? 0) >= 1 },
  { id: "mind-ascendant", title: "Mind Ascendant", description: "Complete all four Brain Arena games.", tier: "Ascendant", reward: 100, group: "Brain Arena", check: (s) => GAME_IDS.every((g) => (s.brain.completed[g] ?? 0) >= 1) },
];

/** Achievements are permanent once earned; reward granted exactly once. */
export function applyAchievements(s: GameState): GameState {
  let ach = s.achievements;
  for (const a of ACHIEVEMENTS) if (!ach[a.id] && a.check(s)) ach = { ...ach, [a.id]: todayKey() };
  return ach === s.achievements ? s : { ...s, achievements: ach };
}

/* ---------------- Brain Arena reward service ---------------- */
export const BRAIN_REWARDS = {
  session: 5,
  milestone: 5,
  dailyChallenge: 10,
  dailyCap: 60,
  /** milestone thresholds; reaction is average ms (lower is better) */
  milestones: { memory: 5, pattern: 4, logic: 3, reaction: 350 } as Record<GameId, number>,
  lowerIsBetter: { reaction: true } as Partial<Record<GameId, boolean>>,
};

export function dailyGame(date = todayKey()): GameId {
  const n = date.split("-").reduce((a, p) => a + Number(p), 0);
  return GAME_IDS[n % GAME_IDS.length];
}

export function brainToday(s: GameState, date = todayKey()) {
  const list = Object.values(s.brain.sessions).filter((x) => x.date === date);
  return { played: list.length, xp: list.reduce((a, b) => a + b.xp, 0), dailyDone: list.some((x) => x.daily) };
}

export const reachedMilestone = (game: GameId, score: number) =>
  BRAIN_REWARDS.lowerIsBetter[game] ? score > 0 && score <= BRAIN_REWARDS.milestones[game] : score >= BRAIN_REWARDS.milestones[game];

export interface ClaimResult { ok: boolean; xp: number; reason?: string; milestone?: boolean; daily?: boolean; newBest?: boolean }

/**
 * Records a finished session once. Local-only: this is client-side validation and is not tamper-proof.
 * `valid` = the session was actually played to completion (not abandoned).
 */
export function claimBrainSession(s: GameState, sessionId: string, game: GameId, score: number, extra: { patternSolved?: number } = {}): { state: GameState; result: ClaimResult } {
  if (!sessionId || s.brain.sessions[sessionId]) return { state: s, result: { ok: false, xp: 0, reason: "This session was already recorded." } };
  if (!GAME_IDS.includes(game) || !Number.isFinite(score) || score < 0) return { state: s, result: { ok: false, xp: 0, reason: "Invalid session." } };
  const date = todayKey();
  const today = brainToday(s, date);
  const milestone = reachedMilestone(game, score);
  const daily = !today.dailyDone && game === dailyGame(date);
  let xp = BRAIN_REWARDS.session + (milestone ? BRAIN_REWARDS.milestone : 0) + (daily ? BRAIN_REWARDS.dailyChallenge : 0);
  xp = Math.max(0, Math.min(xp, BRAIN_REWARDS.dailyCap - today.xp));
  const prevBest = s.brain.best[game];
  const better = BRAIN_REWARDS.lowerIsBetter[game] ? score > 0 && (prevBest === undefined || score < prevBest) : prevBest === undefined || score > prevBest;
  const next: GameState = {
    ...s,
    brain: {
      best: better ? { ...s.brain.best, [game]: score } : s.brain.best,
      completed: { ...s.brain.completed, [game]: (s.brain.completed[game] ?? 0) + 1 },
      patternSolved: s.brain.patternSolved + (extra.patternSolved ?? 0),
      sessions: { ...s.brain.sessions, [sessionId]: { game, date, score, xp, milestone, daily } },
    },
  };
  return {
    state: applyAchievements(next),
    result: { ok: true, xp, milestone, daily, newBest: better, reason: xp === 0 ? "Daily Brain Arena XP limit reached — score still recorded." : undefined },
  };
}

/* ---------------- Validation / migration ---------------- */
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Validate untrusted stored data (v1 or v2); fall back to defaults field by field. Never drops valid user data. */
export function sanitize(raw: unknown): GameState {
  const base = initialState();
  if (!isObj(raw)) return base;
  const quests: Quest[] = [];
  if (Array.isArray(raw["quests"])) {
    for (const q of raw["quests"] as unknown[]) {
      if (!isObj(q) || typeof q["id"] !== "string" || typeof q["title"] !== "string") continue;
      const xp = Number(q["xp"]);
      if (!(xp > 0)) continue;
      const rawCat = String(q["category"]);
      const category = (CATEGORIES as readonly string[]).includes(rawCat) ? (rawCat as Category) : LEGACY_CATEGORY[rawCat] ?? "Health";
      quests.push({
        id: q["id"], title: q["title"].slice(0, 80),
        description: typeof q["description"] === "string" ? q["description"].slice(0, 200) : "",
        category, xp: Math.min(500, Math.round(xp)),
        difficulty: (DIFFICULTIES as readonly string[]).includes(String(q["difficulty"])) ? (q["difficulty"] as Difficulty) : "medium",
        recurrence: "daily",
        status: q["status"] === "paused" ? "paused" : "active",
        starter: q["starter"] === true,
        createdAt: typeof q["createdAt"] === "string" ? q["createdAt"] : todayKey(),
      });
    }
  }
  const ids = new Set(quests.map((q) => q.id));
  const completions: Record<string, number> = {};
  if (isObj(raw["completions"])) {
    for (const [k, v] of Object.entries(raw["completions"])) {
      const [qid = "", date = ""] = k.split("|");
      if (ids.has(qid) && DATE_RE.test(date) && typeof v === "number" && v > 0) completions[k] = v;
    }
  }
  const achievements: Record<string, string> = {};
  if (isObj(raw["achievements"])) {
    for (const [k, v] of Object.entries(raw["achievements"])) if (ACHIEVEMENTS.some((a) => a.id === k) && typeof v === "string") achievements[k] = v;
  }
  const brain = base.brain;
  const rb = raw["brain"];
  if (isObj(rb)) {
    for (const g of GAME_IDS) {
      const best = isObj(rb["best"]) ? rb["best"][g] : undefined;
      if (typeof best === "number" && best >= 0) brain.best[g] = best;
      const c = isObj(rb["completed"]) ? rb["completed"][g] : undefined;
      if (typeof c === "number" && c >= 0) brain.completed[g] = Math.floor(c);
    }
    if (typeof rb["patternSolved"] === "number") brain.patternSolved = Math.max(0, Math.floor(rb["patternSolved"]));
    if (isObj(rb["sessions"])) {
      for (const [id, v] of Object.entries(rb["sessions"])) {
        if (!isObj(v) || !GAME_IDS.includes(v["game"] as GameId) || typeof v["date"] !== "string" || !DATE_RE.test(v["date"])) continue;
        brain.sessions[id] = {
          game: v["game"] as GameId, date: v["date"], score: Number(v["score"]) || 0,
          xp: Math.max(0, Math.min(BRAIN_REWARDS.dailyCap, Number(v["xp"]) || 0)), milestone: v["milestone"] === true, daily: v["daily"] === true,
        };
      }
    }
  }
  const settings = base.settings;
  const rs = raw["settings"];
  if (isObj(rs)) {
    for (const k of ["music", "sfx", "ambient", "reducedMotion"] as const) if (typeof rs[k] === "boolean") settings[k] = rs[k] as boolean;
    for (const k of ["musicVolume", "sfxVolume"] as const) if (typeof rs[k] === "number") settings[k] = Math.min(1, Math.max(0, rs[k] as number));
  }
  // v1 profiles already had a board; treat them as seeded so their quests are never altered.
  const seeded = raw["seeded"] === true || raw["version"] === 1;
  const pn = raw["playerName"];
  return {
    version: 2,
    playerName: typeof pn === "string" && pn.trim() && pn !== "Adventurer" ? pn.slice(0, 40) : pn === "Adventurer" ? "Adventurer" : base.playerName,
    avatar: (AVATARS as readonly string[]).includes(String(raw["avatar"])) ? String(raw["avatar"]) : base.avatar,
    specialization: (SPECIALIZATIONS as readonly string[]).includes(String(raw["specialization"])) ? String(raw["specialization"]) : base.specialization,
    seeded, quests, completions, achievements, brain, settings,
  };
}
