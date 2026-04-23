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
