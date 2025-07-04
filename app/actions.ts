'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Zod schema for input validation
const todoSchema = z.object({
  text: z.string().min(1, 'Task text cannot be empty.'),
});

/**
 * Creates a new todo item.
 * @param formData - The form data containing the todo text.
 * @returns An object with a success or error message.
 */
export async function createTodo(formData: FormData) {
  const validation = todoSchema.safeParse({
    text: formData.get('text'),
  });

  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors.text?.[0],
    };
  }

  try {
    await prisma.todo.create({
      data: {
        text: validation.data.text,
      },
    });
    revalidatePath('/'); // Re-renders the page to show the new todo
    return { success: 'Todo created successfully.' };
  } catch (error) {
    return { error: 'Failed to create todo.' };
  }
}

/**
 * Fetches all todo items from the database.
 * @returns A promise that resolves to an array of todos.
 */
export async function getTodos() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc', // Show newest todos first
      },
    });
    return todos;
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return []; // Return an empty array on error
  }
}

/**
 * Removes a todo item by its ID.
 * @param id - The ID of the todo to remove.
 * @returns An object with a success or error message.
 */
export async function removeTodo(id: string) {
  try {
    await prisma.todo.delete({
      where: { id },
    });
    revalidatePath('/');
    return { success: 'Todo removed successfully.' };
  } catch (error) {
    return { error: 'Failed to remove todo.' };
  }
}

