"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, BookOpen, Plus, Camera, X } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useReadingTimer } from "@/context/ReadingTimerContext";
import { createClient } from "@/lib/supabase/client";
import { uploadReadingPhoto } from "@/lib/storage";
import { formatSeconds } from "@/utils/formatTime";
import { BookFinishedModal } from "@/components/dashboard/BookFinishedModal";
import type { Book } from "@/types";
export function ReadingTimerWidget({ books }: { books: Book[] }) {
  const { isRunning, elapsedSeconds, selectedBookId, start, stop } = useReadingTimer();
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [showStopModal, setShowStopModal] = useState(false);
  const [pagesRead, setPagesRead] = useState("0");
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [finishedBook, setFinishedBook] = useState<Book | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default to first "reading" book, then first "pending" book
  useEffect(() => {
    if (books.length > 0 && !selectedBook) {
      const reading = books.find((b) => b.status === "reading");
      setSelectedBook(reading?.id ?? books[0].id);
    }
  }, [books, selectedBook]);

  const activeBookId = selectedBookId ?? selectedBook;
  const currentBook = books.find((b) => b.id === activeBookId);
  const percent =
    currentBook && currentBook.total_pages > 0
      ? Math.round((currentBook.current_page / currentBook.total_pages) * 100)
      : 0;

  const handleStart = async () => {
    if (!activeBookId) return;
    // Auto-set status to "reading" if it was "pending"
    if (currentBook?.status === "pending") {
      const supabase = createClient();
      await supabase.from("books").update({ status: "reading" }).eq("id", activeBookId);
    }
    start(activeBookId);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleStop = async () => {
    setSaving(true);
    const pages = parseInt(pagesRead) || 0;

    // Detectar si el libro se termina con esta sesión
    const willFinish =
      currentBook &&
      currentBook.total_pages > 0 &&
      currentBook.current_page + pages >= currentBook.total_pages;

    let photoUrl: string | undefined;
    if (photoFile) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        photoUrl = (await uploadReadingPhoto(user.id, photoFile)) ?? undefined;
      }
    }
    await stop(pages, photoUrl);
    setSaving(false);
    setShowStopModal(false);
    setPagesRead("0");
    removePhoto();

    if (willFinish && currentBook) setFinishedBook(currentBook);
  };

  if (books.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-24 bg-plum/10 dark:bg-plum/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-plum/40" size={28} />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Empieza a leer hoy</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Agrega un libro y comienza a construir tu racha de lectura
            </p>
            <Link href="/books">
              <Button>
                <Plus size={15} />
                Agregar mi primer libro
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  const readingBooks = books.filter((b) => b.status === "reading");
  const pendingBooks = books.filter((b) => b.status === "pending");

  return (
    <>
      <Card className="p-5">
        <div className="flex items-center gap-4">

          {/* Book cover */}
          <div className="w-14 h-20 bg-plum/10 dark:bg-plum/20 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
            {currentBook?.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentBook.cover_url}
                alt={currentBook.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="text-plum" size={20} />
            )}
          </div>

          {/* Info + controls */}
          <div className="flex-1 min-w-0">
            {isRunning ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span className="text-xs text-[var(--text-muted)] truncate">
                    {currentBook?.title ?? "Leyendo..."}
                  </span>
                </div>
                <div className="text-3xl font-mono font-black text-[var(--text-primary)] leading-none tracking-tight">
                  {formatSeconds(elapsedSeconds)}
                </div>
                <p className="text-xs text-[var(--text-muted)]">sesión activa</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-[var(--text-primary)] text-sm truncate">
                    {currentBook?.title ?? "Selecciona un libro"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {currentBook?.author}
                  </p>
                </div>
                {currentBook && currentBook.total_pages > 0 && (
                  <div className="space-y-0.5">
                    <ProgressBar value={percent} />
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Pág {currentBook.current_page} de {currentBook.total_pages} · {percent}%
                    </p>
                  </div>
                )}
                {currentBook?.status === "pending" && (
                  <p className="text-[11px] text-plum font-medium">
                    Se marcará como &quot;leyendo&quot; al iniciar
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {isRunning ? (
              <Button variant="danger" size="md" onClick={() => setShowStopModal(true)}>
                <Square size={13} />
                Detener
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleStart}
                disabled={!activeBookId}
                className="shadow-glow animate-pulse-slow px-6 font-bold tracking-wide"
              >
                <Play size={16} fill="currentColor" />
                Leer
              </Button>
            )}

            {/* Book selector — only when not running and multiple books */}
            {!isRunning && books.length > 1 && (
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="text-xs bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-plum/40 cursor-pointer max-w-36"
              >
                {readingBooks.length > 0 && (
                  <optgroup label="Leyendo">
                    {readingBooks.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </optgroup>
                )}
                {pendingBooks.length > 0 && (
                  <optgroup label="Pendientes">
                    {pendingBooks.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}
          </div>
        </div>
      </Card>

      {finishedBook && (
        <BookFinishedModal
          book={finishedBook}
          onClose={() => setFinishedBook(null)}
        />
      )}

      <Modal open={showStopModal} onClose={() => setShowStopModal(false)} title="Finalizar sesión">
        <div className="space-y-4">
          <div className="bg-[var(--bg-card-hover)] rounded-xl p-3 text-center">
            <div className="text-2xl font-mono font-bold text-[var(--text-primary)]">
              {formatSeconds(elapsedSeconds)}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">tiempo leído</p>
          </div>
          <Input
            label="Páginas leídas (opcional)"
            id="pages-read"
            type="number"
            min="0"
            value={pagesRead}
            onChange={(e) => setPagesRead(e.target.value)}
            placeholder="0"
          />

          {/* Photo picker */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--text-secondary)]">Foto del momento (opcional)</p>
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="preview" className="w-full h-40 object-cover" />
                <button
                  onClick={removePhoto}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[var(--border)] rounded-xl py-5 flex flex-col items-center gap-2 text-[var(--text-muted)] hover:border-plum/40 hover:text-plum transition-colors"
              >
                <Camera size={20} />
                <span className="text-xs">Agregar foto</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowStopModal(false)}>Cancelar</Button>
            <Button onClick={handleStop} loading={saving}>Guardar sesión</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
