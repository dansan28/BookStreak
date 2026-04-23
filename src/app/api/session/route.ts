import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { book_id, duration_minutes, pages_read, date } = body;

    if (!book_id || !duration_minutes || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await supabase.from("reading_sessions").insert({
      user_id: user.id,
      book_id,
      duration_minutes,
      pages_read: pages_read ?? 0,
      date,
    });

    await supabase.rpc("update_streak", { p_user_id: user.id });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
