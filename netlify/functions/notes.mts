import type { Context } from '@netlify/functions';
import { eq, desc, and, isNull, or } from 'drizzle-orm';
import { db } from '../../db';
import { notes, members } from '../../db/schema';

export default async (req: Request, context: Context) => {
  const headers = { 'Content-Type': 'application/json' };

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  const taskId = url.searchParams.get('taskId');

  if (req.method === 'GET') {
    // Build where conditions based on params
    let whereCondition;
    if (projectId && taskId) {
      whereCondition = or(
        eq(notes.projectId, projectId),
        eq(notes.taskId, taskId)
      );
    } else if (projectId) {
      whereCondition = and(
        eq(notes.projectId, projectId),
        isNull(notes.taskId)
      );
    } else if (taskId) {
      whereCondition = eq(notes.taskId, taskId);
    } else {
      return new Response(JSON.stringify({ error: 'projectId or taskId required' }), {
        status: 400,
        headers
      });
    }

    // Get notes with author info
    const allNotes = await db
      .select({
        id: notes.id,
        projectId: notes.projectId,
        taskId: notes.taskId,
        content: notes.content,
        authorId: notes.authorId,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        authorName: members.name,
        authorInitials: members.initials,
        authorColor: members.color,
      })
      .from(notes)
      .leftJoin(members, eq(notes.authorId, members.id))
      .where(whereCondition)
      .orderBy(desc(notes.createdAt));

    // Transform to include author object
    const notesWithAuthor = allNotes.map(note => ({
      id: note.id,
      projectId: note.projectId,
      taskId: note.taskId,
      content: note.content,
      authorId: note.authorId,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      author: note.authorId ? {
        id: note.authorId,
        name: note.authorName,
        initials: note.authorInitials,
        color: note.authorColor,
      } : null,
    }));

    return new Response(JSON.stringify(notesWithAuthor), { headers });
  }

  if (req.method === 'POST') {
    const body = await req.json();

    if (!body.content || typeof body.content !== 'string') {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers
      });
    }

    if (!body.projectId && !body.taskId) {
      return new Response(JSON.stringify({ error: 'projectId or taskId required' }), {
        status: 400,
        headers
      });
    }

    const [newNote] = await db.insert(notes).values({
      projectId: body.projectId || null,
      taskId: body.taskId || null,
      content: body.content.trim(),
      authorId: body.authorId || null,
    }).returning();

    // Fetch with author info
    if (newNote.authorId) {
      const [author] = await db.select().from(members).where(eq(members.id, newNote.authorId));
      return new Response(JSON.stringify({
        ...newNote,
        author: author ? {
          id: author.id,
          name: author.name,
          initials: author.initials,
          color: author.color,
        } : null,
      }), { status: 201, headers });
    }

    return new Response(JSON.stringify({ ...newNote, author: null }), { status: 201, headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers
  });
};

export const config = {
  path: '/api/notes',
};
