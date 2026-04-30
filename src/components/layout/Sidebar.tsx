"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  BookMarked,
  Sparkles,
  Images,
  UserCircle,
} from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/books", icon: BookOpen, label: "Biblioteca" },
  { href: "/recommendations", icon: Sparkles, label: "Descubrir" },
  { href: "/gallery", icon: Images, label: "Galería" },
  { href: "/profile", icon: UserCircle, label: "Mi perfil" },
  { href: "/settings", icon: Settings, label: "Ajustes" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 h-full bg-[var(--bg-card)] border-r border-[var(--border)] py-6">
      <div className="px-5 mb-8">
        <div className="flex items-center gap-2.5">
          <BookMarked className="text-plum" size={22} />
          <span className="text-lg font-bold text-[var(--text-primary)]">BookStreak</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-plum/10 text-plum dark:bg-plum/20 dark:text-plum-light"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
