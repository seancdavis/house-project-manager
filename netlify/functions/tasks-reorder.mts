import type { Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { tasks } from '../../db/schema';

export default async (req: Request, _context: Context) => {
  const headers = { 'Content-Type': 'application/json' };

  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  }

  try {
    const body = await req.json();

    // Expecting: { taskIds: string[] } - tasks in new order
    if (!body.taskIds || !Array.isArray(body.taskIds)) {
      return new Response(JSON.stringify({ error: 'taskIds array required' }), {
        status: 400,
        headers
      });
    }

    // Update sortOrder for each task based on position
    for (let i = 0; i < body.taskIds.length; i++) {
      await db.update(tasks)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(eq(tasks.id, body.taskIds[i]));
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error) {
    console.error('Tasks reorder error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to reorder tasks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers
    });
  }
};

export const config = {
  path: '/api/tasks-reorder',
};
