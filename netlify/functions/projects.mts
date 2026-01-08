import type { Context } from '@netlify/functions';
import { desc } from 'drizzle-orm';
import { db } from '../../db';
import { projects } from '../../db/schema';

export default async (req: Request, _context: Context) => {
  const headers = { 'Content-Type': 'application/json' };

  if (req.method === 'GET') {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return new Response(JSON.stringify(allProjects), { headers });
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const [newProject] = await db.insert(projects).values({
      title: body.title,
      description: body.description,
      type: body.type,
      status: body.status || 'not_started',
      ownerId: body.ownerId,
      implementerId: body.implementerId,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
    }).returning();
    return new Response(JSON.stringify(newProject), { status: 201, headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers
  });
};

export const config = {
  path: '/api/projects',
};
