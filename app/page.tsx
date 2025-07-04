import { getTodos, createTodo, removeTodo, updateTodoCompletion } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

export default async function Home() {
  const todos = await getTodos();

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background text-foreground">
      <div className="z-10 w-full max-w-2xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-center lg:text-left">Modern Todo</h1>
      </div>

      <div className="w-full max-w-2xl">
        {/* Form to Create Todos */}
        <form action={createTodo} className="flex items-center gap-2 mb-8">
          <Input
            type="text"
            name="text"
            placeholder="Add a new task..."
            className="flex-grow"
            required
          />
          <Button type="submit">Add Task</Button>
        </form>

        {/* Todo List */}
        <div className="space-y-4">
          {todos.length > 0 ? (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <form action={async () => {
                    'use server';
                    await updateTodoCompletion(todo.id, !todo.completed);
                  }}>
                    <button type="submit" className="flex items-center gap-4">
                      <Checkbox
                        id={`todo-${todo.id}`}
                        checked={todo.completed}
                        className="form-checkbox h-5 w-5 text-primary rounded"
                      />
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`flex-grow ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {todo.text}
                      </label>
                    </button>
                  </form>
                </div>
                <form action={async () => {
                  'use server';
                  await removeTodo(todo.id);
                }}>
                  <Button variant="ghost" size="icon" type="submit">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </form>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No tasks yet. Add one above!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

