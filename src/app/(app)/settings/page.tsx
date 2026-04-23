"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useProfile } from "@/hooks/useProfile";
import { Target, Palette, User } from "lucide-react";

export default function SettingsPage() {
  const { updateGoal } = useProfile();
  const [goalMinutes, setGoalMinutes] = useState(30);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("daily_goal_minutes")
        .eq("user_id", user.id)
        .single();
      if (profile) setGoalMinutes(profile.daily_goal_minutes);
    };
    load();
  }, []);

  const handleSaveGoal = async () => {
    setSaving(true);
    await updateGoal(goalMinutes);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Ajustes</h2>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User className="text-[var(--text-muted)]" size={16} />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Cuenta</h3>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--text-muted)]">Email</span>
          <span className="text-sm text-[var(--text-primary)]">{email}</span>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="text-[var(--text-muted)]" size={16} />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Meta diaria de lectura</h3>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={goalMinutes}
            onChange={(e) => setGoalMinutes(parseInt(e.target.value))}
            className="flex-1 accent-plum"
          />
          <span className="text-sm font-semibold text-[var(--text-primary)] w-16 text-right">
            {goalMinutes} min
          </span>
        </div>

        <div className="flex gap-2 justify-end">
          <Button onClick={handleSaveGoal} loading={saving} variant={saved ? "secondary" : "primary"}>
            {saved ? "Guardado" : "Guardar meta"}
          </Button>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="text-[var(--text-muted)]" size={16} />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Apariencia</h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">Tema</span>
          <ThemeToggle />
        </div>
      </Card>
    </div>
  );
}
