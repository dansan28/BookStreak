"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, BookMarked } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/utils/cn";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/books": "Mis Libros",
  "/recommendations": "Descubrir",
  "/stats": "Estadísticas",
  "/settings": "Ajustes",
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const title = Object.entries(pageTitles).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] ?? "BookStreak";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className={cn(
      "flex items-center justify-between px-6 py-4",
      "border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm"
    )}>
      <div className="flex items-center gap-3 md:hidden">
        <BookMarked className="text-plum" size={20} />
        <span className="font-bold text-[var(--text-primary)]">BookStreak</span>
      </div>
      <h1 className="hidden md:block text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h1>

      <div className="flex items-center gap-3 ml-auto">
        <ThemeToggle />
        <button
          onClick={handleSignOut}
          title="Cerrar sesión"
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
