const BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY ?? "";

export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    description?: string;
    categories?: string[];
    averageRating?: number;
    publishedDate?: string;
    language?: string;
  };
}

export interface MappedBook {
  googleId: string;
  title: string;
  author: string;
  total_pages: number;
  cover_url: string | null;
  description: string | null;
  categories: string[];
  publishedDate: string | null;
  averageRating: number | null;
}

function buildUrl(params: Record<string, string | number>): string {
  const url = new URL(BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  if (API_KEY) url.searchParams.set("key", API_KEY);
  return url.toString();
}

function mapVolume(vol: GoogleBookVolume): MappedBook {
  const info = vol.volumeInfo;
  const rawThumb = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
  
  // Limpiamos la URL: pasamos a https y quitamos el parámetro edge=curl
  const cover_url = rawThumb 
    ? rawThumb.replace("http://", "https://").replace("&edge=curl", "") 
    : null;

  return {
    googleId: vol.id,
    title: info.title ?? "Sin título",
    author: info.authors?.join(", ") ?? "Autor desconocido",
    total_pages: info.pageCount ?? 0,
    cover_url,
    description: info.description ?? null,
    categories: info.categories ?? [],
    publishedDate: info.publishedDate ?? null,
    averageRating: info.averageRating ?? null,
  };
}
async function fetchVolumes(params: Record<string, string | number>): Promise<MappedBook[]> {
  try {
    const url = buildUrl(params);
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Google Books API error:", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    return ((data.items ?? []) as GoogleBookVolume[]).map(mapVolume);
  } catch (e) {
    console.error("Google Books fetch failed:", e);
    return [];
  }
}

export async function searchBooks(query: string, maxResults = 12): Promise<MappedBook[]> {
  return fetchVolumes({
    q: query,
    maxResults,
    printType: "books",
    orderBy: "relevance",
  });
}

export async function getBooksByAuthor(author: string, maxResults = 8): Promise<MappedBook[]> {
  return fetchVolumes({
    q: `inauthor:"${author}"`,
    maxResults,
    printType: "books",
    orderBy: "relevance",
  });
}

export async function getBooksByCategory(category: string, maxResults = 8): Promise<MappedBook[]> {
  return fetchVolumes({
    q: `subject:${category}`,
    maxResults,
    printType: "books",
    orderBy: "relevance",
  });
}

export async function getPopularBooks(query: string, maxResults = 8): Promise<MappedBook[]> {
  return fetchVolumes({
    q: query,
    maxResults,
    printType: "books",
    orderBy: "relevance",
  });
}
