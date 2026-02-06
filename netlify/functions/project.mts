import type { Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { projects, tasks, tags, projectTags, activities } from '../../db/schema';

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

    // Get tags for this project
    const projectTagsList = await db
      .select({
        id: tags.id,
        name: tags.name,
        createdAt: tags.createdAt,
      })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(eq(projectTags.projectId, id));

    return new Response(JSON.stringify({ ...project, tags: projectTagsList }), { headers });
  }

  if (req.method === 'PUT') {
    const body = await req.json();

    // Determine completedAt based on status change
    let completedAt = undefined;
    if (body.status === 'completed') {
      // Get current project to check if it was already completed
      const [current] = await db.select().from(projects).where(eq(projects.id, id));
      if (current && current.status !== 'completed') {
        completedAt = new Date();
      } else if (current) {
        completedAt = current.completedAt;
      }
    } else {
      completedAt = null; // Clear if not completed
    }

    const [updated] = await db.update(projects)
      .set({
        title: body.title,
        description: body.description,
        type: body.type,
        status: body.status,
        priority: body.priority || null,
        ownerId: body.ownerId || null,
        implementerId: body.implementerId || null,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        estimatedBudget: body.estimatedBudget ?? null,
        actualBudget: body.actualBudget ?? null,
        updatedAt: new Date(),
        completedAt,
      })
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers
      });
    }

    // Handle tags update
    if (body.tagIds !== undefined) {
      // Remove existing tags
      await db.delete(projectTags).where(eq(projectTags.projectId, id));

      // Add new tags
      if (body.tagIds.length > 0) {
        await db.insert(projectTags).values(
          body.tagIds.map((tagId: string) => ({
            projectId: id,
            tagId,
          }))
        );
      }
    }

    // Record activity - use 'completed' action if status changed to completed
    const action = body.status === 'completed' && completedAt ? 'completed' : 'updated';
    await db.insert(activities).values({
      action,
      entityType: 'project',
      entityId: updated.id,
      entityTitle: updated.title,
      projectId: updated.id,
      actorId: body.actorId || null,
    });

    return new Response(JSON.stringify(updated), { headers });
  }

  if (req.method === 'DELETE') {
    // Get project info before deletion for activity
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers
      });
    }

    // Get actorId from request body if provided
    let actorId = null;
    try {
      const body = await req.json();
      actorId = body.actorId || null;
    } catch {
      // No body provided, that's fine
    }

    // Delete associated tags first (cascades from schema, but explicit for clarity)
    await db.delete(projectTags).where(eq(projectTags.projectId, id));

    // Delete associated tasks
    await db.delete(tasks).where(eq(tasks.projectId, id));

    await db.delete(projects).where(eq(projects.id, id));

    // Record activity after successful deletion
    await db.insert(activities).values({
      action: 'deleted',
      entityType: 'project',
      entityId: id,
      entityTitle: project.title,
      projectId: null, // Project no longer exists
      actorId,
    });

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
