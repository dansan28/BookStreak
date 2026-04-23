import { BookCard } from "./BookCard";
import type { Book, BookStatus } from "@/types";

interface BookGridProps {
  books: Book[];
  filter?: BookStatus | "all";
}

export function BookGrid({ books, filter = "all" }: BookGridProps) {
  const filtered = filter === "all" ? books : books.filter((b) => b.status === filter);

  if (filtered.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
        <p className="text-sm">No hay libros aquí todavía</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {filtered.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
