"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useBooks } from "@/hooks/useBooks";

interface AddBookModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddBookModal({ open, onClose }: AddBookModalProps) {
  const { addBook } = useBooks();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    author: "",
    total_pages: "",
    cover_url: "",
    status: "pending" as "pending" | "reading",
  });

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
      await addBook({
        title: form.title.trim(),
        author: form.author.trim(),
        total_pages: parseInt(form.total_pages) || 0,
        cover_url: form.cover_url.trim() || undefined,
        status: form.status,
      });
      setForm({ title: "", author: "", total_pages: "", cover_url: "", status: "pending" });
      onClose();
    } catch {
      setError("Error al agregar el libro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Agregar libro">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título *"
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="El nombre del libro"
          required
        />
        <Input
          label="Autor *"
          id="author"
          name="author"
          value={form.author}
          onChange={handleChange}
          placeholder="Nombre del autor"
          required
        />
        <Input
          label="Total de páginas"
          id="total_pages"
          name="total_pages"
          type="number"
          min="1"
          value={form.total_pages}
          onChange={handleChange}
          placeholder="300"
        />
        <Input
          label="URL de portada (opcional)"
          id="cover_url"
          name="cover_url"
          type="url"
          value={form.cover_url}
          onChange={handleChange}
          placeholder="https://..."
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-medium text-[var(--text-primary)]">
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-plum/40"
          >
            <option value="pending">Pendiente</option>
            <option value="reading">Leyendo</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Agregar libro
          </Button>
        </div>
      </form>
    </Modal>
  );
}
