import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookDetailClient } from "./BookDetailClient";

export default async function BookDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!book) notFound();

  const { data: sessions } = await supabase
    .from("reading_sessions")
    .select("id, duration_minutes, pages_read, date, note")
    .eq("book_id", book.id)
    .order("date", { ascending: false })
    .limit(20);

  const totalMinutes = (sessions ?? []).reduce((s, r) => s + r.duration_minutes, 0);

  return <BookDetailClient book={book} sessions={sessions ?? []} totalMinutes={totalMinutes} />;
}
