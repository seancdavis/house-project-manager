import type { Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { tasks } from '../../db/schema';

export default async (req: Request, context: Context) => {
  const headers = { 'Content-Type': 'application/json' };
  const id = context.params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Task ID required' }), {
      status: 400,
      headers
    });
  }

  if (req.method === 'GET') {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers
      });
    }
    return new Response(JSON.stringify(task), { headers });
  }

  if (req.method === 'PUT') {
    const body = await req.json();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      updateData.title = body.title;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
      updateData.completedAt = body.status === 'done' ? new Date() : null;
    }
    if (body.assigneeId !== undefined) {
      updateData.assigneeId = body.assigneeId;
    }
    if (body.sortOrder !== undefined) {
      updateData.sortOrder = body.sortOrder;
    }

    const [updated] = await db.update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers
      });
    }
    return new Response(JSON.stringify(updated), { headers });
  }

  if (req.method === 'DELETE') {
    const [deleted] = await db.delete(tasks)
      .where(eq(tasks.id, id))
      .returning();

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Task not found' }), {
        status: 404,
        headers
      });
    }
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers
  });
};

export const config = {
  path: '/api/tasks/:id',
};
