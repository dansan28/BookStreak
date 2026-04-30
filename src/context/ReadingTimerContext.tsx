"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { todayDateString } from "@/utils/formatTime";

interface TimerContextValue {
  isRunning: boolean;
  elapsedSeconds: number;
  selectedBookId: string | null;
  activeBookId: string | null;
  setActiveBook: (id: string) => void;
  start: (bookId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: (pagesRead?: number, photoUrl?: string, note?: string) => Promise<void>;
  reset: () => void;
}

const ReadingTimerContext = createContext<TimerContextValue>({
  isRunning: false,
  elapsedSeconds: 0,
  selectedBookId: null,
  activeBookId: null,
  setActiveBook: () => {},
  start: () => {},
  pause: () => {},
  resume: () => {},
  stop: async () => {},
  reset: () => {},
});

export function ReadingTimerProvider({ children }: { children: React.ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const setActiveBook = useCallback((id: string) => setActiveBookId(id), []);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const start = useCallback((bookId: string) => {
    setSelectedBookId(bookId);
    setActiveBookId(bookId);
    setElapsedSeconds(0);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(
    async (pagesRead = 0, photoUrl?: string, note?: string) => {
      if (!selectedBookId) return;
      setIsRunning(false);
      const durationMinutes = Math.max(1, Math.floor(elapsedSeconds / 60));

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from("reading_sessions").insert({
          user_id: user.id,
          book_id: selectedBookId,
          duration_minutes: durationMinutes,
          pages_read: pagesRead,
          date: todayDateString(),
          ...(photoUrl ? { photo_url: photoUrl } : {}),
          ...(note?.trim() ? { note: note.trim() } : {}),
        });

        if (pagesRead > 0) {
          const { data: book } = await supabase
            .from("books")
            .select("current_page, total_pages")
            .eq("id", selectedBookId)
            .single();

          if (book) {
            const newPage = Math.min(book.current_page + pagesRead, book.total_pages);
            const newStatus = newPage >= book.total_pages ? "finished" : "reading";
            await supabase
              .from("books")
              .update({ current_page: newPage, status: newStatus })
              .eq("id", selectedBookId);
          }
        }

        await supabase.rpc("update_streak", { p_user_id: user.id });
      } catch (e) {
        console.error("Failed to save session", e);
      }

      setElapsedSeconds(0);
      setSelectedBookId(null);
      setActiveBookId(null);
    },
    [selectedBookId, elapsedSeconds]
  );

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setSelectedBookId(null);
    setActiveBookId(null);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isRunning || !selectedBookId || elapsedSeconds < 60) return;
      const minutes = Math.floor(elapsedSeconds / 60);
      navigator.sendBeacon(
        "/api/session",
        JSON.stringify({
          book_id: selectedBookId,
          duration_minutes: minutes,
          pages_read: 0,
          date: todayDateString(),
        })
      );
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRunning, selectedBookId, elapsedSeconds]);

  return (
    <ReadingTimerContext.Provider
      value={{ isRunning, elapsedSeconds, selectedBookId, activeBookId, setActiveBook, start, pause, resume, stop, reset }}
    >
      {children}
    </ReadingTimerContext.Provider>
  );
}

export const useReadingTimer = () => useContext(ReadingTimerContext);
