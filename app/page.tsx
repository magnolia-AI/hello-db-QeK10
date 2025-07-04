'use client';

import { useEffect, useState, useTransition } from 'react';
import { getTodos, createTodo, removeTodo, updateTodoCompletion, updateTodo } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { Todo } from '@prisma/client';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchTodos() {
      const fetchedTodos = await getTodos();
      setTodos(fetchedTodos);
    }
    fetchTodos();
  }, []);

  const handleCreateTodo = async (formData: FormData) => {
    const text = formData.get('text') as string;
    if (!text.trim()) return;

    // Reset the form
    const form = document.getElementById('create-todo-form') as HTMLFormElement;
    form.reset();

    startTransition(async () => {
      const tempId = `temp-${Date.now()}`;
      const newTodo: Todo = {
        id: tempId,
        text,
        completed: false,
        priority: 'MEDIUM',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTodos(prev => [newTodo, ...prev]);

      const result = await createTodo(formData);
      if (result?.error) {
        setTodos(prev => prev.filter(t => t.id !== tempId));
        alert(result.error);
      }
      const fetchedTodos = await getTodos();
      setTodos(fetchedTodos);
    });
  };

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleUpdateTodo = async (id: string, formData: FormData) => {
    startTransition(async () => {
      const result = await updateTodo(id, formData);
      if (result?.error) {
        alert(result.error);
      } else {
        const fetchedTodos = await getTodos();
        setTodos(fetchedTodos);
        handleCancelEdit();
      }
    });
  };

  const handleToggleCompletion = (id: string, completed: boolean) => {
    startTransition(async () => {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
      await updateTodoCompletion(id, completed);
      const fetchedTodos = await getTodos();
      setTodos(fetchedTodos);
    });
  };

  const handleRemoveTodo = (id: string) => {
    startTransition(async () => {
      setTodos(prev => prev.filter(t => t.id !== id));
      await removeTodo(id);
      const fetchedTodos = await getTodos();
      setTodos(fetchedTodos);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background text-foreground">
      <div className="z-10 w-full max-w-2xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-center lg:text-left">Modern Todo</h1>
      </div>

      <div className="w-full max-w-2xl">
        <form id="create-todo-form" action={handleCreateTodo} className="flex items-center gap-2 mb-8">
          <Input
            type="text"
            name="text"
            placeholder="Add a new task..."
            className="flex-grow"
            required
          />
          <Button type="submit" disabled={isPending}>{isPending ? 'Adding...' : 'Add Task'}</Button>
        </form>

        <div className="space-y-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
            >
              {editingId === todo.id ? (
                <form action={(formData) => handleUpdateTodo(todo.id, formData)} className="flex-grow flex items-center gap-2">
                  <Input
                    type="text"
                    name="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-grow"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" type="submit" disabled={isPending}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" type="button" onClick={handleCancelEdit} disabled={isPending}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={(checked) => handleToggleCompletion(todo.id, !!checked)}
                      className="form-checkbox h-5 w-5 text-primary rounded"
                    />
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className={`flex-grow cursor-pointer ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {todo.text}
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(todo)} disabled={isPending}>
                      <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveTodo(todo.id)} disabled={isPending}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {todos.length === 0 && (
            <p className="text-center text-muted-foreground">
              No tasks yet. Add one to get started!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

