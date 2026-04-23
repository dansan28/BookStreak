import { Badge } from "@/components/ui/Badge";
import type { BookStatus } from "@/types";

const statusConfig: Record<BookStatus, { label: string; variant: "default" | "success" | "warning" | "info" | "purple" }> = {
  pending: { label: "Pendiente", variant: "default" },
  reading: { label: "Leyendo", variant: "info" },
  finished: { label: "Terminado", variant: "success" },
};

export function BookStatusBadge({ status }: { status: BookStatus }) {
  const { label, variant } = statusConfig[status];
  return <Badge variant={variant}>{label}</Badge>;
}
