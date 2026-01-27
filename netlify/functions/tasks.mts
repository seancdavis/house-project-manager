import type { Context } from '@netlify/functions';
import { eq, asc } from 'drizzle-orm';
import { db } from '../../db';
import { tasks } from '../../db/schema';

export default async (req: Request, context: Context) => {
  const headers = { 'Content-Type': 'application/json' };
  const projectId = context.params.projectId;

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Project ID required' }), {
      status: 400,
      headers
    });
  }

  try {
    if (req.method === 'GET') {
      const projectTasks = await db.select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt));
      return new Response(JSON.stringify(projectTasks), { headers });
    }

    if (req.method === 'POST') {
      const body = await req.json();

      // Get max sort order for this project
      const existing = await db.select()
        .from(tasks)
        .where(eq(tasks.projectId, projectId))
        .orderBy(asc(tasks.sortOrder));
      const maxOrder = existing.length > 0 ? Math.max(...existing.map(t => t.sortOrder)) : -1;

      const [newTask] = await db.insert(tasks).values({
        projectId,
        title: body.title,
        status: body.status || 'todo',
        assigneeId: body.assigneeId,
        sortOrder: body.sortOrder ?? maxOrder + 1,
      }).returning();
      return new Response(JSON.stringify(newTask), { status: 201, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  } catch (error) {
    console.error('Tasks API error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers
    });
  }
};

export const config = {
  path: '/api/projects/:projectId/tasks',
};
