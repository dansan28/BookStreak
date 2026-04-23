"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { BookGrid } from "@/components/books/BookGrid";
import { BookSearchModal } from "@/components/books/BookSearchModal";
import type { Book, BookStatus } from "@/types";
import { cn } from "@/utils/cn";

const FILTERS: { value: "all" | BookStatus; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "reading", label: "Leyendo" },
  { value: "pending", label: "Pendientes" },
  { value: "finished", label: "Terminados" },
];

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filter, setFilter] = useState<"all" | BookStatus>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });
    setBooks(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Mis Libros</h2>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          Agregar libro
        </Button>
      </div>

      <div className="flex gap-1.5">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
              filter === value
                ? "bg-plum text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-[var(--text-muted)]">Cargando...</div>
      ) : (
        <BookGrid books={books} filter={filter} />
      )}

      <BookSearchModal
        open={showAdd}
        onClose={() => {
          setShowAdd(false);
          fetchBooks();
        }}
      />
    </div>
  );
}
