"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useProfile } from "@/hooks/useProfile";
import { uploadAvatar } from "@/lib/storage";
import { Target, Palette, User, Camera } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { updateGoal, updateUsername, updateAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [goalMinutes, setGoalMinutes] = useState(30);

  const [savingGoal, setSavingGoal] = useState(false);
  const [savedGoal, setSavedGoal] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("daily_goal_minutes, username, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (profile) {
        setGoalMinutes(profile.daily_goal_minutes);
        setUsername(profile.username ?? "");
        setAvatarUrl(profile.avatar_url ?? null);
      }
    };
    load();
  }, []);

  const handleSaveGoal = async () => {
    setSavingGoal(true);
    await updateGoal(goalMinutes);
    setSavingGoal(false);
    setSavedGoal(true);
    setTimeout(() => setSavedGoal(false), 2000);
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) { toast.error("El nombre no puede estar vacío"); return; }
    if (username.trim().length < 3) { toast.error("Mínimo 3 caracteres"); return; }
    setSavingUsername(true);
    try {
      await updateUsername(username.trim());
      toast.success("Nombre actualizado");
    } catch {
      toast.error("Error al guardar el nombre");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(userId, file);
      if (!url) throw new Error("Upload failed");
      await updateAvatar(url);
      setAvatarUrl(url);
      toast.success("Foto de perfil actualizada");
    } catch {
      toast.error("Error al subir la foto");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initial = (username || email || "?")[0].toUpperCase();

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Ajustes</h2>

      {/* Perfil */}
      <Card className="p-5 space-y-5">
        <div className="flex items-center gap-2">
          <User className="text-[var(--text-muted)]" size={16} />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Perfil</h3>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-plum/15 dark:bg-plum/25 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-plum">{initial}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-full p-1.5 hover:bg-[var(--bg-card-hover)] transition-colors disabled:opacity-50"
            >
              <Camera size={12} className="text-[var(--text-muted)]" />
            </button>
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            {uploadingAvatar ? "Subiendo..." : "Haz clic en el icono para cambiar tu foto"}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Input
            label="Nombre de usuario"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu nombre de usuario"
          />
          <div className="flex justify-end">
            <Button onClick={handleSaveUsername} loading={savingUsername} size="sm">
              Guardar nombre
            </Button>
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="flex flex-col gap-1 pt-1 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)]">Email</span>
          <span className="text-sm text-[var(--text-primary)]">{email}</span>
        </div>
      </Card>

      {/* Meta diaria */}
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
          <Button onClick={handleSaveGoal} loading={savingGoal} variant={savedGoal ? "secondary" : "primary"}>
            {savedGoal ? "Guardado" : "Guardar meta"}
          </Button>
        </div>
      </Card>

      {/* Apariencia */}
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
