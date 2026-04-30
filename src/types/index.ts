export type BookStatus = "pending" | "reading" | "finished";
export type ThemePreference = "light" | "dark" | "system";

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  daily_goal_minutes: number;
  theme_preference: ThemePreference;
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
  total_minutes: number;
  total_pages_read: number;
  books_finished: number;
  created_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  total_pages: number;
  current_page: number;
  status: BookStatus;
  rating: number | null;
  cover_url: string | null;
  description: string | null;
  created_at: string;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  duration_minutes: number;
  pages_read: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface BookWithProgress extends Book {
  progress_percent: number;
  total_minutes_read: number;
}

export interface DailyStats {
  date: string;
  total_minutes: number;
}
