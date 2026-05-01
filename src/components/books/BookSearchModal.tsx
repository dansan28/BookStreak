"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, BookOpen, Plus, Loader2, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useBooks } from "@/hooks/useBooks";
import { searchBooks, type MappedBook } from "@/lib/googleBooks";
import { cn } from "@/utils/cn";

interface BookSearchModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "search" | "manual";

function BookResult({
  book,
  onAdd,
  adding,
}: {
  book: MappedBook;
  onAdd: (b: MappedBook) => void;
  adding: boolean;
}) {
  return (
    <button
      onClick={() => onAdd(book)}
      disabled={adding}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
        "hover:bg-[var(--bg-card-hover)] group",
        adding && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="w-10 h-14 bg-plum/10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="text-plum" size={16} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{book.title}</p>
        <p className="text-xs text-[var(--text-muted)] line-clamp-1">{book.author}</p>
        {book.total_pages > 0 && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{book.total_pages} páginas</p>
        )}
      </div>
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {adding ? (
          <Loader2 size={16} className="text-plum animate-spin" />
        ) : (
          <ChevronRight size={16} className="text-[var(--text-muted)]" />
        )}
      </div>
    </button>
  );
}

export function BookSearchModal({ open, onClose }: BookSearchModalProps) {
  const { addBook } = useBooks();
  const [tab, setTab] = useState<Tab>("search");

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MappedBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manual form state
  const [form, setForm] = useState({
    title: "",
    author: "",
    total_pages: "",
    cover_url: "",
    status: "pending" as "pending" | "reading",
  });
  const [manualLoading, setManualLoading] = useState(false);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSearchError(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const found = await searchBooks(val.trim());
      setSearching(false);
      if (found.length === 0 && val.trim()) setSearchError(true);
      setResults(found);
    }, 450);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSearchError(false);
      setAddingId(null);
      setForm({ title: "", author: "", total_pages: "", cover_url: "", status: "pending" });
    }
  }, [open]);

  const handleAddFromSearch = async (book: MappedBook) => {
    setAddingId(book.googleId);
    try {
      await addBook({
        title: book.title,
        author: book.author,
        total_pages: book.total_pages,
        cover_url: book.cover_url ?? undefined,
        description: book.description ?? undefined,
        status: "pending",
      });
      onClose();
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Error al agregar el libro";
      toast.error(msg);
      setAddingId(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      toast.error("Título y autor son obligatorios");
      return;
    }
    setManualLoading(true);
    try {
      await addBook({
        title: form.title.trim(),
        author: form.author.trim(),
        total_pages: parseInt(form.total_pages) || 0,
        cover_url: form.cover_url.trim() || undefined,
        status: form.status,
      });
      onClose();
    } catch {
      toast.error("Error al agregar el libro");
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Agregar libro" className="max-w-lg">
      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-card-hover)] rounded-xl p-1 mb-5">
        {(["search", "manual"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-sm font-medium transition-all",
              tab === t
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            {t === "search" ? "Buscar libro" : "Agregar manualmente"}
          </button>
        ))}
      </div>

      {tab === "search" ? (
        <div className="space-y-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Buscar por título, autor..."
              autoFocus
              className={cn(
                "w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]",
                "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                "focus:outline-none focus:ring-2 focus:ring-plum/40 transition-colors"
              )}
            />
            {searching && (
              <Loader2
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-plum animate-spin"
              />
            )}
          </div>

          <div className="max-h-80 overflow-y-auto -mx-2 px-2">
            {results.length > 0 ? (
              <div className="space-y-0.5">
                {results.map((book) => (
                  <BookResult
                    key={book.googleId}
                    book={book}
                    onAdd={handleAddFromSearch}
                    adding={addingId === book.googleId}
                  />
                ))}
              </div>
            ) : searchError ? (
              <div className="flex flex-col items-center gap-2 py-10 text-[var(--text-muted)]">
                <AlertCircle size={20} />
                <p className="text-sm">No encontramos resultados para &quot;{query}&quot;</p>
                <button
                  onClick={() => setTab("manual")}
                  className="text-xs text-plum hover:text-plum-dark font-medium"
                >
                  Agregar manualmente
                </button>
              </div>
            ) : !query.trim() ? (
              <div className="flex flex-col items-center gap-2 py-10 text-[var(--text-muted)]">
                <Search size={20} className="opacity-40" />
                <p className="text-sm">Escribe título + autor para mejores resultados</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <Input
            label="Título *"
            id="m-title"
            name="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="El nombre del libro"
            required
          />
          <Input
            label="Autor *"
            id="m-author"
            name="author"
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            placeholder="Nombre del autor"
            required
          />
          <Input
            label="Total de páginas"
            id="m-pages"
            type="number"
            min="1"
            value={form.total_pages}
            onChange={(e) => setForm((f) => ({ ...f, total_pages: e.target.value }))}
            placeholder="300"
          />
          <Input
            label="URL de portada (opcional)"
            id="m-cover"
            type="url"
            value={form.cover_url}
            onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))}
            placeholder="https://..."
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="m-status" className="text-sm font-medium text-[var(--text-primary)]">
              Estado
            </label>
            <select
              id="m-status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "pending" | "reading" }))}
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-plum/40"
            >
              <option value="pending">Pendiente</option>
              <option value="reading">Leyendo</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={manualLoading}>
              <Plus size={15} />
              Agregar libro
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
