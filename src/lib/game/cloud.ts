// Cloud save: one row per player holding the full game state, so progress follows the account.
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { sanitize, type GameState } from "./rules";

export async function loadCloud(userId: string): Promise<GameState | null> {
  const { data, error } = await supabase.from("game_saves").select("state").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data ? sanitize(data.state) : null;
}

export async function saveCloud(userId: string, state: GameState) {
  const { error } = await supabase.from("game_saves").upsert({ user_id: userId, state: state as unknown as Json, updated_at: new Date().toISOString() });
  if (error) throw error;
}
