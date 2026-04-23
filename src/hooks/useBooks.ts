"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BookStatus } from "@/types";

export interface AddBookInput {
  title: string;
  author: string;
  total_pages: number;
  cover_url?: string;
  description?: string;
  status?: BookStatus;
}

export function useBooks() {
  const router = useRouter();
  const supabase = createClient();

  const addBook = async (input: AddBookInput) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("books").insert({
      user_id: user.id,
      title: input.title,
      author: input.author,
      total_pages: input.total_pages,
      cover_url: input.cover_url ?? null,
      description: input.description ?? null,
      status: input.status ?? "pending",
      current_page: 0,
    });

    if (error) throw error;
    router.refresh();
  };

  const updateBook = async (
    id: string,
    updates: Partial<{
      title: string;
      author: string;
      total_pages: number;
      current_page: number;
      status: BookStatus;
      rating: number | null;
      cover_url: string | null;
    }>
  ) => {
    const { error } = await supabase.from("books").update(updates).eq("id", id);
    if (error) throw error;
    router.refresh();
  };

  const deleteBook = async (id: string) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) throw error;
    router.refresh();
  };

  const updateStatus = async (id: string, status: BookStatus) => {
    const { error } = await supabase.from("books").update({ status }).eq("id", id);
    if (error) throw error;
    router.refresh();
  };

  const updateRating = async (id: string, rating: number) => {
    const { error } = await supabase.from("books").update({ rating }).eq("id", id);
    if (error) throw error;
    router.refresh();
  };

  return { addBook, updateBook, deleteBook, updateStatus, updateRating };
}
