import { useState, FormEvent } from 'react';
import { X, Plus, Calendar, Tag, AlignLeft, Flag } from 'lucide-react';
import { Priority, Todo } from '../lib/supabase';

interface TodoFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    priority: Priority;
    due_date: string | null;
    category: string;
  }) => void;
  onClose: () => void;
  initial?: Todo;
  categories: string[];
}

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Rendah', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  { value: 'medium', label: 'Sedang', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  { value: 'high', label: 'Tinggi', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
];

export default function TodoForm({ onSubmit, onClose, initial, categories }: TodoFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [categoryInput, setCategoryInput] = useState(initial?.category ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate || null,
      category: categoryInput.trim(),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">
            {initial ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Judul Tugas <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Apa yang perlu dilakukan?"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Deskripsi
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tambahkan deskripsi (opsional)..."
              rows={3}
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5" /> Prioritas
            </label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                    priority === p.value
                      ? p.color
                      : 'text-slate-500 bg-slate-900/30 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Tenggat
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm [color-scheme:dark]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Kategori
              </label>
              <input
                type="text"
                list="categories"
                value={categoryInput}
                onChange={e => { setCategoryInput(e.target.value); setCategory(e.target.value); }}
                placeholder="cth: Kerja"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <datalist id="categories">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              {initial ? 'Simpan Perubahan' : 'Tambah Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
