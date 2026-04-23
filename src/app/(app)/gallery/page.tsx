import { createClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export default async function GalleryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: sessions } = await supabase
    .from("reading_sessions")
    .select("id, photo_url, date, duration_minutes, pages_read, books(title, cover_url)")
    .eq("user_id", user.id)
    .not("photo_url", "is", null)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const photos = (sessions ?? []).map((s) => ({
    ...s,
    books: Array.isArray(s.books) ? (s.books[0] ?? null) : s.books,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Galería de lectura</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Momentos capturados mientras leías
        </p>
      </div>
      <GalleryGrid photos={photos as Parameters<typeof GalleryGrid>[0]["photos"]} />
    </div>
  );
}
