"use client";

import { useReadingTimer } from "@/context/ReadingTimerContext";
import { CompactBookRow } from "./CompactBookRow";
import type { Book } from "@/types";

export function OtherReadingBooks({ books }: { books: Book[] }) {
  const { activeBookId } = useReadingTimer();

  const readingBooks = books.filter((b) => b.status === "reading");
  const activeId = activeBookId ?? readingBooks[0]?.id;
  const others = readingBooks.filter((b) => b.id !== activeId);

  if (others.length === 0) return null;

  return (
    <div className="mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden py-1">
      {others.map((book) => (
        <CompactBookRow key={book.id} book={book} />
      ))}
    </div>
  );
}
