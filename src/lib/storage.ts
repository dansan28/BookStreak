import { createClient } from "./supabase/client";

export async function uploadReadingPhoto(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("reading-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("reading-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { cacheControl: "3600", upsert: true });

  if (error) {
    console.error("Avatar upload error:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  // Bust cache with timestamp so the new image loads immediately
  return `${data.publicUrl}?t=${Date.now()}`;
}
