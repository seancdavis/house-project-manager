import type { Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { projects, tasks } from '../../db/schema';

export default async (req: Request, context: Context) => {
  const headers = { 'Content-Type': 'application/json' };
  const id = context.params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Project ID required' }), {
      status: 400,
      headers
    });
  }

  if (req.method === 'GET') {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers
      });
    }
    return new Response(JSON.stringify(project), { headers });
  }

  if (req.method === 'PUT') {
    const body = await req.json();
    const [updated] = await db.update(projects)
      .set({
        title: body.title,
        description: body.description,
        type: body.type,
        status: body.status,
        ownerId: body.ownerId,
        implementerId: body.implementerId,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        updatedAt: new Date(),
        completedAt: body.status === 'completed' ? new Date() : null,
      })
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers
      });
    }
    return new Response(JSON.stringify(updated), { headers });
  }

  if (req.method === 'DELETE') {
    // Delete associated tasks first
    await db.delete(tasks).where(eq(tasks.projectId, id));

    const [deleted] = await db.delete(projects)
      .where(eq(projects.id, id))
      .returning();

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
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
  path: '/api/projects/:id',
};
