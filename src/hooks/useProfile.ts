"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ThemePreference } from "@/types";

export function useProfile() {
  const router = useRouter();
  const supabase = createClient();

  const updateGoal = async (daily_goal_minutes: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update({ daily_goal_minutes })
      .eq("user_id", user.id);
    if (error) throw error;
    router.refresh();
  };

  const updateThemePreference = async (theme_preference: ThemePreference) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update({ theme_preference })
      .eq("user_id", user.id);
    if (error) throw error;
    router.refresh();
  };

  const updateUsername = async (username: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("user_id", user.id);
    if (error) throw error;
    router.refresh();
  };

  const updateAvatar = async (avatar_url: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url })
      .eq("user_id", user.id);
    if (error) throw error;
    router.refresh();
  };

  return { updateGoal, updateThemePreference, updateUsername, updateAvatar };
}
