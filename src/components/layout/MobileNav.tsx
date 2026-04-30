"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Settings, Sparkles, Images, UserCircle } from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/books", icon: BookOpen, label: "Libros" },
  { href: "/recommendations", icon: Sparkles, label: "Descubrir" },
  { href: "/gallery", icon: Images, label: "Galería" },
  { href: "/profile", icon: UserCircle, label: "Perfil" },
  { href: "/settings", icon: Settings, label: "Ajustes" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-t border-[var(--border)] px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0",
                active ? "text-plum" : "text-[var(--text-muted)]"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
