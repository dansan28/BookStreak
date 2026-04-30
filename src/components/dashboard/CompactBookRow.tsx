import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Book } from "@/types";

export function CompactBookRow({ book }: { book: Book }) {
  const percent = book.total_pages > 0
    ? Math.round((book.current_page / book.total_pages) * 100)
    : 0;

  return (
    <Link href={`/books/${book.id}`}>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors group">
        <div className="w-9 h-12 bg-plum/10 dark:bg-plum/20 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="text-plum" size={14} />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate leading-tight">{book.title}</p>
            <p className="text-[11px] text-[var(--text-muted)] truncate">{book.author}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ProgressBar value={percent} />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0 w-7 text-right">{percent}%</span>
          </div>
        </div>
        <ChevronRight size={13} className="text-[var(--text-muted)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
