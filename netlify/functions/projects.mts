import type { Context } from '@netlify/functions';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { projects, tags, projectTags } from '../../db/schema';

export default async (req: Request, _context: Context) => {
  const headers = { 'Content-Type': 'application/json' };

  if (req.method === 'GET') {
    // Get all projects
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));

    // Get tags for all projects
    const allProjectTags = await db
      .select({
        projectId: projectTags.projectId,
        tagId: projectTags.tagId,
        tagName: tags.name,
      })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id));

    // Attach tags to projects
    const projectsWithTags = allProjects.map(project => ({
      ...project,
      tags: allProjectTags
        .filter(pt => pt.projectId === project.id)
        .map(pt => ({ id: pt.tagId, name: pt.tagName })),
    }));

    return new Response(JSON.stringify(projectsWithTags), { headers });
  }

  if (req.method === 'POST') {
    const body = await req.json();

    // Create project
    const [newProject] = await db.insert(projects).values({
      title: body.title,
      description: body.description,
      type: body.type,
      status: body.status || 'not_started',
      priority: body.priority || null,
      ownerId: body.ownerId || null,
      implementerId: body.implementerId || null,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      estimatedBudget: body.estimatedBudget || null,
      actualBudget: body.actualBudget || null,
    }).returning();

    // Handle tags
    if (body.tagIds && body.tagIds.length > 0) {
      await db.insert(projectTags).values(
        body.tagIds.map((tagId: string) => ({
          projectId: newProject.id,
          tagId,
        }))
      );
    }

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
