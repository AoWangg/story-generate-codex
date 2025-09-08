import { getSupabase } from "@/lib/supabase";
import { Story } from "@/types/story";

// Fetch a user's stories from Supabase `stories` table
export async function listUserStories(userId: string, limit = 100): Promise<Story[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data: rows, error } = await supabase
    .from("stories")
    .select("id, title, theme, content, image_url, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (rows || []).map((r: any) => ({
    id: String(r.id),
    theme: r.theme,
    content: r.content,
    title: r.title || r.content?.split("\n")[0]?.substring(0, 50) || r.theme || "Story",
    createdAt: r.created_at,
    imageUrl: r.image_url || undefined,
  }));
}

// Delete a single story by id
export async function deleteUserStory(storyId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("stories").delete().eq("id", storyId);
  if (error) throw error;
}

// Clear all stories for the provided user id
export async function clearUserStories(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("stories").delete().eq("user_id", userId);
  if (error) throw error;
}

