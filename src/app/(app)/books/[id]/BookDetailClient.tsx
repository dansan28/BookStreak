"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Pencil, Trash2, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StarRating } from "@/components/ui/StarRating";
import { BookStatusBadge } from "@/components/books/BookStatusBadge";
import { EditBookModal } from "@/components/books/EditBookModal";
import { useBooks } from "@/hooks/useBooks";
import { formatTotalMinutes } from "@/utils/formatTime";
import type { Book } from "@/types";

interface Props {
  book: Book;
  sessions: { duration_minutes: number; pages_read: number; date: string }[];
  totalMinutes: number;
}

export function BookDetailClient({ book, sessions, totalMinutes }: Props) {
  const router = useRouter();
  const { deleteBook, updateRating } = useBooks();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const percent = book.total_pages > 0
    ? Math.round((book.current_page / book.total_pages) * 100)
    : 0;

  const handleDelete = async () => {
    setDeleting(true);
    await deleteBook(book.id);
    router.push("/books");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">{book.title}</h2>
      </div>

      <Card className="p-5">
        <div className="flex gap-5">
          <div className="w-24 h-36 bg-plum/10 dark:bg-plum/20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="text-plum" size={28} />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{book.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{book.author}</p>
            </div>

            <BookStatusBadge status={book.status} />

            {book.total_pages > 0 && (
              <div className="space-y-1">
                <ProgressBar value={percent} showLabel />
                <p className="text-xs text-[var(--text-muted)]">
                  Pág {book.current_page} de {book.total_pages}
                </p>
              </div>
            )}

            {book.status === "finished" && (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Tu valoración</p>
                <StarRating
                  value={book.rating}
                  onChange={(r) => updateRating(book.id, r)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-[var(--bg-card-hover)] rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {formatTotalMinutes(totalMinutes)}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">Tiempo leído</div>
          </div>
          <div className="bg-[var(--bg-card-hover)] rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-[var(--text-primary)]">
              {sessions.length}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">Sesiones</div>
          </div>
        </div>

        {book.description && (
          <div className="mt-5 pt-4 border-t border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Sinopsis</p>
            <p className={`text-sm text-[var(--text-secondary)] leading-relaxed ${descExpanded ? "" : "line-clamp-6"}`}>
              {book.description}
            </p>
            <button
              onClick={() => setDescExpanded((v) => !v)}
              className="text-xs text-plum font-medium mt-1.5 hover:underline"
            >
              {descExpanded ? "Leer menos" : "Leer más"}
            </button>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <Button variant="secondary" onClick={() => setShowEdit(true)} className="flex-1">
            <Pencil size={14} />
            Editar
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)} loading={deleting}>
            <Trash2 size={14} />
          </Button>
        </div>
      </Card>

      <EditBookModal book={book} open={showEdit} onClose={() => setShowEdit(false)} />

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar libro"
        className="max-w-sm"
      >
        <div className="flex flex-col gap-5">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-red-500/10 flex-shrink-0">
              <TriangleAlert size={18} className="text-red-500 dark:text-red-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                ¿Eliminar &ldquo;{book.title}&rdquo;?
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Se borrarán el libro y todas sus sesiones de lectura. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              className="bg-red-500/15 hover:bg-red-500/25 dark:bg-red-500/20 dark:hover:bg-red-500/30"
            >
              <Trash2 size={14} />
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
