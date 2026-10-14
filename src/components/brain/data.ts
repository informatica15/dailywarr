import type { GameId } from "@/lib/game/rules";

export const GAME_INFO: Record<GameId, { name: string; tagline: string; time: string }> = {
  memory: { name: "Memory Sequence", tagline: "Repeat the glowing sequence as it grows.", time: "2–3 min" },
  pattern: { name: "Pattern Predictor", tagline: "Find the missing piece in each pattern.", time: "3 min" },
  logic: { name: "Logic Chamber", tagline: "Solve short deduction puzzles.", time: "3–4 min" },
  reaction: { name: "Reaction Rift", tagline: "Strike the moment the rift opens.", time: "1 min" },
};
