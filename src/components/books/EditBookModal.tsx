"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useBooks } from "@/hooks/useBooks";
import type { Book } from "@/types";

interface EditBookModalProps {
  book: Book;
  open: boolean;
  onClose: () => void;
}

export function EditBookModal({ book, open, onClose }: EditBookModalProps) {
  const { updateBook } = useBooks();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    total_pages: String(book.total_pages),
    current_page: String(book.current_page),
    cover_url: book.cover_url ?? "",
    status: book.status,
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: book.title,
        author: book.author,
        total_pages: String(book.total_pages),
        current_page: String(book.current_page),
        cover_url: book.cover_url ?? "",
        status: book.status,
      });
    }
  }, [open, book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      setError("Título y autor son obligatorios");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await updateBook(book.id, {
        title: form.title.trim(),
        author: form.author.trim(),
        total_pages: parseInt(form.total_pages) || 0,
        current_page: parseInt(form.current_page) || 0,
        cover_url: form.cover_url.trim() || null,
        status: form.status as Book["status"],
      });
      onClose();
    } catch {
      setError("Error al actualizar el libro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar libro">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Título *" id="edit-title" name="title" value={form.title} onChange={handleChange} required />
        <Input label="Autor *" id="edit-author" name="author" value={form.author} onChange={handleChange} required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Páginas totales" id="edit-total" name="total_pages" type="number" min="1" value={form.total_pages} onChange={handleChange} />
          <Input label="Página actual" id="edit-current" name="current_page" type="number" min="0" value={form.current_page} onChange={handleChange} />
        </div>
        <Input label="URL portada (opcional)" id="edit-cover" name="cover_url" type="url" value={form.cover_url} onChange={handleChange} placeholder="https://..." />
        <div className="flex flex-col gap-1">
          <label htmlFor="edit-status" className="text-sm font-medium text-[var(--text-primary)]">Estado</label>
          <select
            id="edit-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-plum/40"
          >
            <option value="pending">Pendiente</option>
            <option value="reading">Leyendo</option>
            <option value="finished">Terminado</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>Guardar cambios</Button>
        </div>
      </form>
    </Modal>
  );
}
