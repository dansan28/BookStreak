import { createClient } from "@/lib/supabase/server";
import { RecommendationsClient } from "@/components/recommendations/RecommendationsClient";

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: books } = await supabase
    .from("books")
    .select("title, author, status")
    .eq("user_id", user.id)
    .in("status", ["reading", "finished"])
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: allBooks } = await supabase
    .from("books")
    .select("title")
    .eq("user_id", user.id);

  const userBookTitles = (allBooks ?? []).map((b) => b.title.toLowerCase());

  const readBooks = books ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Descubrir</h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Recomendaciones basadas en lo que lees
        </p>
      </div>
      <RecommendationsClient readBooks={readBooks} userBookTitles={userBookTitles} />
    </div>
  );
}
