import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BookOpen, ChevronRight } from "lucide-react";
import type { Book } from "@/types";

export function CurrentlyReadingCard({ book }: { book: Book }) {
  const percent = book.total_pages > 0
    ? Math.round((book.current_page / book.total_pages) * 100)
    : 0;

  return (
    <Link href={`/books/${book.id}`}>
      <Card hover className="p-4 flex items-center gap-4">
        <div className="w-12 h-16 bg-plum/10 dark:bg-plum/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <BookOpen className="text-plum" size={20} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{book.title}</h3>
          <p className="text-xs text-[var(--text-muted)] truncate mb-2">{book.author}</p>
          <ProgressBar value={percent} showLabel />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pág {book.current_page} de {book.total_pages}
          </p>
        </div>
        <ChevronRight className="text-[var(--text-muted)] flex-shrink-0" size={16} />
      </Card>
    </Link>
  );
}
