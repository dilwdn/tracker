import { useState, useEffect, useCallback } from 'react';
import { supabase, Todo, Priority } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export type FilterStatus = 'all' | 'active' | 'completed';
export type SortBy = 'created_at' | 'due_date' | 'priority' | 'title';

export interface TodoFilters {
  status: FilterStatus;
  priority: Priority | 'all';
  category: string;
  search: string;
  sortBy: SortBy;
}

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setTodos(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  async function addTodo(payload: {
    title: string;
    description: string;
    priority: Priority;
    due_date: string | null;
    category: string;
  }) {
    if (!user) return;
    const { data, error } = await supabase
      .from('todos')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single();

    if (error) { setError(error.message); return; }
    setTodos(prev => [data, ...prev]);
  }

  async function updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) { setError(error.message); return; }
    setTodos(prev => prev.map(t => t.id === id ? data : t));
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) { setError(error.message); return; }
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  async function toggleTodo(id: string) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    await updateTodo(id, { completed: !todo.completed });
  }

  const categories = Array.from(new Set(todos.map(t => t.category).filter(Boolean)));

  return { todos, loading, error, addTodo, updateTodo, deleteTodo, toggleTodo, categories, refetch: fetchTodos };
}
