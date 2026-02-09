import type { Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { notes, members, activities, tasks } from '../../db/schema';

export default async (req: Request, context: Context) => {
  const headers = { 'Content-Type': 'application/json' };
  const noteId = context.params.id;

  if (!noteId) {
    return new Response(JSON.stringify({ error: 'Note ID required' }), {
      status: 400,
      headers
    });
  }

  if (req.method === 'PUT') {
    const body = await req.json();

    if (!body.content || typeof body.content !== 'string') {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers
      });
    }

    const [updated] = await db.update(notes)
      .set({
        content: body.content.trim(),
        updatedAt: new Date(),
      })
      .where(eq(notes.id, noteId))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Note not found' }), {
        status: 404,
        headers
      });
    }

    // Record activity - resolve projectId from task if needed
    const notePreview = updated.content.length > 50
      ? updated.content.substring(0, 50) + '...'
      : updated.content;
    let activityProjectId = updated.projectId;
    if (!activityProjectId && updated.taskId) {
      const [task] = await db.select({ projectId: tasks.projectId }).from(tasks).where(eq(tasks.id, updated.taskId));
      if (task) activityProjectId = task.projectId;
    }
    await db.insert(activities).values({
      action: 'updated',
      entityType: 'note',
      entityId: updated.id,
      entityTitle: notePreview,
      projectId: activityProjectId,
      actorId: body.actorId || updated.authorId || null,
    });

    // Fetch with author info
    if (updated.authorId) {
      const [author] = await db.select().from(members).where(eq(members.id, updated.authorId));
      return new Response(JSON.stringify({
        ...updated,
        author: author ? {
          id: author.id,
          name: author.name,
          initials: author.initials,
          color: author.color,
        } : null,
      }), { headers });
    }

    return new Response(JSON.stringify({ ...updated, author: null }), { headers });
  }

  if (req.method === 'DELETE') {
    // Get note info before deletion for activity
    const [note] = await db.select().from(notes).where(eq(notes.id, noteId));
    if (!note) {
      return new Response(JSON.stringify({ error: 'Note not found' }), {
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
      // No body provided
    }

    await db.delete(notes).where(eq(notes.id, noteId));

    // Record activity - resolve projectId from task if needed
    const notePreview = note.content.length > 50
      ? note.content.substring(0, 50) + '...'
      : note.content;
    let activityProjectId = note.projectId;
    if (!activityProjectId && note.taskId) {
      const [task] = await db.select({ projectId: tasks.projectId }).from(tasks).where(eq(tasks.id, note.taskId));
      if (task) activityProjectId = task.projectId;
    }
    await db.insert(activities).values({
      action: 'deleted',
      entityType: 'note',
      entityId: noteId,
      entityTitle: notePreview,
      projectId: activityProjectId,
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
  path: '/api/notes/:id',
};
