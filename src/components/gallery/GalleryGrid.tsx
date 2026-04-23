"use client";

import { useState } from "react";
import { Camera, BookOpen, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatMinutes } from "@/utils/formatTime";

interface Photo {
  id: string;
  photo_url: string | null;
  date: string;
  duration_minutes: number;
  pages_read: number;
  books: { title: string; cover_url: string | null } | null;
}

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <Card className="p-10 flex flex-col items-center gap-3 text-[var(--text-muted)]">
        <Camera size={32} className="opacity-30" />
        <p className="text-sm font-medium">Aún no hay fotos</p>
        <p className="text-xs text-center max-w-xs">
          Cuando termines una sesión de lectura, puedes añadir una foto del momento. Aparecerá aquí.
        </p>
      </Card>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setLightbox(photo)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-plum/10 dark:bg-plum/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.photo_url!}
              alt={photo.books?.title ?? "Sesión de lectura"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
              <p className="text-white text-xs font-semibold leading-tight truncate">
                {photo.books?.title ?? "Libro eliminado"}
              </p>
              <p className="text-white/70 text-[10px] mt-0.5">{formatDate(photo.date)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-lg w-full bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.photo_url!}
              alt={lightbox.books?.title ?? ""}
              className="w-full max-h-80 object-cover"
            />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-14 bg-plum/10 dark:bg-plum/20 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                {lightbox.books?.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lightbox.books.cover_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen size={14} className="text-plum" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                  {lightbox.books?.title ?? "Libro eliminado"}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(lightbox.date)}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-muted)]">
                  <span>{formatMinutes(lightbox.duration_minutes)}</span>
                  {lightbox.pages_read > 0 && (
                    <>
                      <span>·</span>
                      <span>{lightbox.pages_read} págs</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
