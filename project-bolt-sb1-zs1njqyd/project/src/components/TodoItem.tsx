import { useState } from 'react';
import { Check, Trash2, Pencil, Calendar, Tag, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { Todo } from '../lib/supabase';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const PRIORITY_STYLES = {
  low: { label: 'Rendah', dot: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  medium: { label: 'Sedang', dot: 'bg-amber-400', text: 'text-amber-400', badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  high: { label: 'Tinggi', dot: 'bg-red-400', text: 'text-red-400', badge: 'bg-red-400/10 text-red-400 border-red-400/20' },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { label: `Terlambat ${Math.abs(diff)} hari`, overdue: true };
  if (diff === 0) return { label: 'Hari ini', overdue: false };
  if (diff === 1) return { label: 'Besok', overdue: false };
  return {
    label: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    overdue: false,
  };
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const priority = PRIORITY_STYLES[todo.priority];
  const dateInfo = todo.due_date ? formatDate(todo.due_date) : null;

  return (
    <div
      className={`group bg-slate-800/50 border rounded-xl transition-all duration-200 ${
        todo.completed
          ? 'border-slate-700/30 opacity-60'
          : dateInfo?.overdue
          ? 'border-red-500/20 hover:border-red-500/40'
          : 'border-slate-700/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id)}
          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
            todo.completed
              ? 'bg-blue-500 border-blue-500'
              : 'border-slate-500 hover:border-blue-400'
          }`}
        >
          {todo.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug ${
                todo.completed ? 'line-through text-slate-500' : 'text-white'
              }`}>
                {todo.title}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${priority.badge}`}>
                  <Flag className="w-2.5 h-2.5" />
                  {priority.label}
                </span>

                {dateInfo && (
                  <span className={`inline-flex items-center gap-1 text-xs ${
                    dateInfo.overdue && !todo.completed ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    {dateInfo.label}
                  </span>
                )}

                {todo.category && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <Tag className="w-3 h-3" />
                    {todo.category}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {todo.description && (
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-all"
                >
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={() => onEdit(todo)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDelete(todo.id)}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-400/10 transition-all"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-700/50 transition-all"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Description expanded */}
          {expanded && todo.description && (
            <p className="text-xs text-slate-400 mt-2 leading-relaxed border-t border-slate-700/50 pt-2">
              {todo.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
