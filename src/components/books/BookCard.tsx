import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StarRating } from "@/components/ui/StarRating";
import { BookStatusBadge } from "./BookStatusBadge";
import type { Book } from "@/types";

export function BookCard({ book }: { book: Book }) {
  const percent = book.total_pages > 0
    ? Math.round((book.current_page / book.total_pages) * 100)
    : 0;

  return (
    <Link href={`/books/${book.id}`}>
      <Card hover className="p-4 h-full flex flex-col gap-3">
        <div className="w-full aspect-[2/3] bg-plum/10 dark:bg-plum/20 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
          {book.cover_url ? (
            <img
              src={`https://images.weserv.nl/?url=${encodeURIComponent(book.cover_url.replace('&edge=curl', ''))}&default=https://via.placeholder.com/150`}
              alt={book.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <BookOpen className="text-plum" size={32} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 mb-0.5">
            {book.title}
          </h3>
          <p className="text-xs text-[var(--text-muted)] truncate mb-2">{book.author}</p>
          <BookStatusBadge status={book.status} />
        </div>

        {book.status === "reading" && (
          <ProgressBar value={percent} showLabel className="mt-auto" />
        )}

        {book.rating !== null && book.status === "finished" && (
          <StarRating value={book.rating} readonly size={13} />
        )}
      </Card>
    </Link>
  );
}
