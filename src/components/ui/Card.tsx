import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-card",
        hover && "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
