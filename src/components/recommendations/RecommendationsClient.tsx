"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { BookOpen, Plus, Loader2, Star, X, Search } from "lucide-react";
import { getBooksByAuthor, getPopularBooks, searchBooks, type MappedBook } from "@/lib/googleBooks";
import { useBooks } from "@/hooks/useBooks";
import { cn } from "@/utils/cn";

interface ReadBook {
  title: string;
  author: string;
  status: string;
}

interface RecommendationsClientProps {
  readBooks: ReadBook[];
  userBookTitles: string[];
}

interface Section {
  title: string;
  books: MappedBook[];
}

// ─── Géneros ────────────────────────────────────────────────────────────────

const GENRES = [
  { id: "all",      label: "Todos" },
  { id: "fiction",  label: "Ficción" },
  { id: "mystery",  label: "Misterio" },
  { id: "scifi",    label: "Sci-Fi" },
  { id: "history",  label: "Historia" },
  { id: "romance",  label: "Romance" },
  { id: "science",  label: "Ciencia" },
  { id: "selfhelp", label: "Personal" },
] as const;

type GenreId = typeof GENRES[number]["id"];

const GENRE_SECTIONS: Record<Exclude<GenreId, "all">, { title: string; query: string }[]> = {
  fiction: [
    { title: "Ficción popular",      query: "fiction bestseller novels" },
    { title: "Ficción literaria",    query: "literary fiction award winner" },
    { title: "Clásicos de ficción",  query: "classic fiction literature must read" },
  ],
  mystery: [
    { title: "Misterio y thriller",  query: "mystery thriller bestseller" },
    { title: "Novela negra",         query: "crime noir detective novels" },
    { title: "Suspense psicológico", query: "psychological suspense thriller" },
  ],
  scifi: [
    { title: "Ciencia ficción moderna",  query: "science fiction modern bestseller" },
    { title: "Space opera",              query: "space opera science fiction novels" },
    { title: "Clásicos de la ciencia ficción", query: "classic science fiction asimov heinlein" },
  ],
  history: [
    { title: "Historia universal",       query: "world history nonfiction bestseller" },
    { title: "Biografías históricas",    query: "historical biography nonfiction" },
    { title: "Historia contemporánea",   query: "modern history 20th century nonfiction" },
  ],
  romance: [
    { title: "Romance contemporáneo",    query: "contemporary romance bestseller novels" },
    { title: "Romance histórico",        query: "historical romance novels bestseller" },
    { title: "Drama y amor",             query: "romance drama love story novels" },
  ],
  science: [
    { title: "Ciencia popular",          query: "popular science nonfiction bestseller" },
    { title: "Física y cosmos",          query: "physics astronomy cosmos popular science" },
    { title: "Naturaleza y biología",    query: "biology nature evolution popular science" },
  ],
  selfhelp: [
    { title: "Desarrollo personal",      query: "self help personal development bestseller" },
    { title: "Productividad y hábitos",  query: "productivity habits success nonfiction" },
    { title: "Mindfulness y bienestar",  query: "mindfulness wellness mental health books" },
  ],
};

const ALL_SECTIONS = [
  { title: "Tendencias 2025",          query: "bestseller 2025 fiction nonfiction" },
  { title: "Premios literarios",       query: "booker prize pulitzer award winner literature" },
  { title: "Clásicos imprescindibles", query: "best classic novels all time must read" },
  { title: "Ciencia y conocimiento",   query: "popular science nonfiction books" },
  { title: "Desarrollo personal",      query: "self improvement productivity books" },
];

// ─── Subcomponentes ──────────────────────────────────────────────────────────

function RecommendationCard({
  book,
  onSelect,
  added,
}: {
  book: MappedBook;
  onSelect: (b: MappedBook) => void;
  added: boolean;
}) {
  return (
    <button onClick={() => onSelect(book)} className="flex-shrink-0 w-36 text-left group">
      <div className="relative w-full aspect-[2/3] bg-plum/10 dark:bg-plum/20 rounded-xl overflow-hidden mb-2 transition-transform duration-200 group-hover:scale-[1.03]">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="text-plum" size={28} />
          </div>
        )}
        {added && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-lg">✓</span>
            </div>
          </div>
        )}
      </div>
      <h4 className="text-xs font-semibold text-[var(--text-primary)] line-clamp-2 leading-tight mb-0.5">
        {book.title}
      </h4>
      <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">{book.author}</p>
      {book.averageRating && (
        <div className="flex items-center gap-0.5 mt-0.5">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-[11px] text-[var(--text-muted)]">{book.averageRating.toFixed(1)}</span>
        </div>
      )}
    </button>
  );
}

function BookPreviewModal({
  book,
  added,
  onAdd,
  onClose,
}: {
  book: MappedBook;
  added: boolean;
  onAdd: (b: MappedBook) => Promise<void>;
  onClose: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    await onAdd(book);
    setAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-44 bg-plum/10 dark:bg-plum/20 flex-shrink-0">
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="text-plum" size={40} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4 -mt-6 relative overflow-y-auto">
          <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">{book.title}</h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{book.author}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)]">
            {book.averageRating && (
              <div className="flex items-center gap-0.5">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span>{book.averageRating.toFixed(1)}</span>
              </div>
            )}
            {book.total_pages > 0 && <span>{book.total_pages} páginas</span>}
            {book.publishedDate && <span>{book.publishedDate.slice(0, 4)}</span>}
          </div>

          {book.description ? (
            <div className="mt-3">
              <p className={`text-sm text-[var(--text-secondary)] leading-relaxed ${descExpanded ? "" : "line-clamp-5"}`}>
                {book.description}
              </p>
              <button
                onClick={() => setDescExpanded((v) => !v)}
                className="text-xs text-plum font-medium mt-1.5 hover:underline"
              >
                {descExpanded ? "Leer menos" : "Leer más"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] mt-3 italic">Sin descripción disponible.</p>
          )}

          <button
            onClick={handleAdd}
            disabled={added || adding}
            className={cn(
              "w-full mt-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
              added
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 cursor-default"
                : "bg-plum text-white hover:bg-plum/90 active:scale-95"
            )}
          >
            {adding ? (
              <Loader2 size={15} className="animate-spin" />
            ) : added ? (
              <><span>✓</span> Agregado a tu biblioteca</>
            ) : (
              <><Plus size={15} /> Agregar a mi biblioteca</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function HorizontalSection({
  section,
  addedTitles,
  onSelect,
}: {
  section: Section;
  addedTitles: Set<string>;
  onSelect: (b: MappedBook) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{section.title}</h3>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {section.books.map((book) => (
          <RecommendationCard
            key={book.googleId}
            book={book}
            onSelect={onSelect}
            added={addedTitles.has(book.title.toLowerCase())}
          />
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-40 bg-[var(--bg-card-hover)] rounded animate-pulse" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="flex-shrink-0 w-36 space-y-2">
                <div className="w-full aspect-[2/3] bg-[var(--bg-card-hover)] rounded-xl animate-pulse" />
                <div className="h-3 bg-[var(--bg-card-hover)] rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-[var(--bg-card-hover)] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export function RecommendationsClient({ readBooks, userBookTitles }: RecommendationsClientProps) {
  const { addBook } = useBooks();
  const [selectedGenre, setSelectedGenre] = useState<GenreId>("all");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionsCache = useRef(new Map<GenreId, Section[]>());
  const [addedTitles, setAddedTitles] = useState<Set<string>>(() => new Set(userBookTitles));
  const [selectedBook, setSelectedBook] = useState<MappedBook | null>(null);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MappedBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSearchError(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const found = await searchBooks(val.trim());
      setSearching(false);
      setSearchResults(found);
      if (found.length === 0) setSearchError(true);
    }, 450);
  }, []);

  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery("");
    setSearchResults([]);
    setSearchError(false);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  useEffect(() => {
    const load = async () => {
      const cached = sectionsCache.current.get(selectedGenre);
      if (cached) {
        setSections(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      const built: Section[] = [];

      if (selectedGenre !== "all") {
        const queries = GENRE_SECTIONS[selectedGenre];
        const results = await Promise.all(queries.map(({ query }) => getPopularBooks(query, 10)));
        queries.forEach(({ title }, i) => {
          const filtered = results[i].filter((b) => !addedTitles.has(b.title.toLowerCase()));
          if (filtered.length >= 2) built.push({ title, books: filtered.slice(0, 8) });
        });
      } else {
        // Secciones personalizadas por autor
        if (readBooks.length > 0) {
          const uniqueAuthors = Array.from(
            new Set(readBooks.map((b) => b.author.split(",")[0].trim()))
          ).slice(0, 2);

          const authorResults = await Promise.all(
            uniqueAuthors.map((author) => getBooksByAuthor(author, 10))
          );
          uniqueAuthors.forEach((author, i) => {
            const filtered = authorResults[i].filter((b) => !addedTitles.has(b.title.toLowerCase()));
            if (filtered.length >= 2) {
              built.push({ title: `Más de ${author}`, books: filtered.slice(0, 8) });
            }
          });
        }

        // Secciones curadas fijas
        const results = await Promise.all(
          ALL_SECTIONS.map(({ query }) => getPopularBooks(query, 10))
        );
        ALL_SECTIONS.forEach(({ title }, i) => {
          const filtered = results[i].filter((b) => !addedTitles.has(b.title.toLowerCase()));
          if (filtered.length >= 2) built.push({ title, books: filtered.slice(0, 8) });
        });
      }

      sectionsCache.current.set(selectedGenre, built);
      setSections(built);
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre]);

  const handleAdd = async (book: MappedBook) => {
    try {
      await addBook({
        title: book.title,
        author: book.author,
        total_pages: book.total_pages,
        cover_url: book.cover_url ?? undefined,
        description: book.description ?? undefined,
        status: "pending",
      });
      setAddedTitles((prev) => {
        const next = new Set(Array.from(prev));
        next.add(book.title.toLowerCase());
        return next;
      });
    } catch {
      // silently fail
    }
  };

  const isSearching = query.trim().length > 0;

  return (
    <>
      {/* Barra de búsqueda persistente */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Buscar libros por título o autor..."
          className={cn(
            "w-full pl-9 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]",
            "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-plum/40 transition-colors",
            isSearching ? "pr-9" : "pr-4"
          )}
        />
        {searching && (
          <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-plum animate-spin" />
        )}
        {isSearching && !searching && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {isSearching ? (
        /* ── Vista de búsqueda ── */
        <div>
          {searching ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="text-plum animate-spin" />
            </div>
          ) : searchError ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <Search size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No encontramos resultados para &ldquo;{query}&rdquo;</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} para &ldquo;{query}&rdquo;
              </p>
              <div className="flex flex-wrap gap-4">
                {searchResults.map((book) => (
                  <RecommendationCard
                    key={book.googleId}
                    book={book}
                    onSelect={setSelectedBook}
                    added={addedTitles.has(book.title.toLowerCase())}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        /* ── Vista de recomendaciones ── */
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide mb-6">
            {GENRES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedGenre(id)}
                className={cn(
                  "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  selectedGenre === id
                    ? "bg-plum text-white"
                    : "bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : sections.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No pudimos cargar recomendaciones</p>
              <p className="text-xs mt-1">Revisa tu conexión e intenta de nuevo</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map((section) => (
                <HorizontalSection
                  key={section.title}
                  section={section}
                  addedTitles={addedTitles}
                  onSelect={setSelectedBook}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedBook && (
        <BookPreviewModal
          book={selectedBook}
          added={addedTitles.has(selectedBook.title.toLowerCase())}
          onAdd={handleAdd}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </>
  );
}
