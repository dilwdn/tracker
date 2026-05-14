import { useState, useMemo } from 'react';
import {
  Plus, Search, LogOut, CheckSquare, ListTodo, CheckCheck,
  Clock, BarChart2, SlidersHorizontal, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTodos, FilterStatus, TodoFilters } from '../hooks/useTodos';
import { Todo, Priority } from '../lib/supabase';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';

const INITIAL_FILTERS: TodoFilters = {
  status: 'all',
  priority: 'all',
  category: '',
  search: '',
  sortBy: 'created_at',
};

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo, categories } = useTodos();
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filters, setFilters] = useState<TodoFilters>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const overdue = todos.filter(t => {
      if (!t.due_date || t.completed) return false;
      return new Date(t.due_date + 'T00:00:00') < new Date(new Date().setHours(0, 0, 0, 0));
    }).length;
    return { total, completed, active, overdue };
  }, [todos]);

  const filtered = useMemo(() => {
    let result = [...todos];

    if (filters.status === 'active') result = result.filter(t => !t.completed);
    if (filters.status === 'completed') result = result.filter(t => t.completed);
    if (filters.priority !== 'all') result = result.filter(t => t.priority === filters.priority);
    if (filters.category) result = result.filter(t => t.category === filters.category);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
      if (filters.sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (filters.sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [todos, filters]);

  function handleEdit(todo: Todo) {
    setEditingTodo(todo);
    setShowForm(true);
  }

  async function handleFormSubmit(data: {
    title: string;
    description: string;
    priority: Priority;
    due_date: string | null;
    category: string;
  }) {
    if (editingTodo) {
      await updateTodo(editingTodo.id, data);
    } else {
      await addTodo(data);
    }
    setEditingTodo(null);
  }

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">TaskFlow</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs hidden sm:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: ListTodo, label: 'Total', value: stats.total, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { icon: CheckCheck, label: 'Selesai', value: stats.completed, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { icon: Clock, label: 'Aktif', value: stats.active, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { icon: BarChart2, label: 'Terlambat', value: stats.overdue, color: 'text-red-400', bg: 'bg-red-400/10' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <p className="text-xl font-bold text-white leading-none">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {stats.total > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 font-medium">Progres Keseluruhan</span>
              <span className="text-sm font-bold text-white">{completionPct}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Search & Actions */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Cari tugas..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`px-3 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-sm font-medium ${
              showFilters
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button
            onClick={() => { setEditingTodo(null); setShowForm(true); }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status filter */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'active', 'completed'] as FilterStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setFilters(f => ({ ...f, status: s }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        filters.status === s
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {{ all: 'Semua', active: 'Aktif', completed: 'Selesai' }[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority filter */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Prioritas</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'high', 'medium', 'low'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setFilters(f => ({ ...f, priority: p }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        filters.priority === p
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {{ all: 'Semua', high: 'Tinggi', medium: 'Sedang', low: 'Rendah' }[p]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Urutkan</label>
                <select
                  value={filters.sortBy}
                  onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as TodoFilters['sortBy'] }))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Terbaru</option>
                  <option value="due_date">Tenggat</option>
                  <option value="priority">Prioritas</option>
                  <option value="title">Judul</option>
                </select>
              </div>
            </div>

            {/* Category filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Kategori</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilters(f => ({ ...f, category: '' }))}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      !filters.category
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setFilters(f => ({ ...f, category: c }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        filters.category === c
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" /> Reset filter
            </button>
          </div>
        )}

        {/* Todo List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-800/50 border border-slate-700/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ListTodo className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">
              {todos.length === 0 ? 'Belum ada tugas' : 'Tidak ada tugas yang sesuai'}
            </p>
            <p className="text-slate-600 text-sm mt-1">
              {todos.length === 0 ? 'Tambahkan tugas pertama Anda' : 'Coba ubah filter Anda'}
            </p>
            {todos.length === 0 && (
              <button
                onClick={() => { setEditingTodo(null); setShowForm(true); }}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all text-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tambah Tugas
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-3">
              Menampilkan {filtered.length} dari {todos.length} tugas
            </p>
            {filtered.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </main>

      {/* Todo Form Modal */}
      {showForm && (
        <TodoForm
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingTodo(null); }}
          initial={editingTodo ?? undefined}
          categories={categories}
        />
      )}
    </div>
  );
}
