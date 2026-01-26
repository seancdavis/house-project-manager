import type { Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { notes, members } from '../../db/schema';

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
    const [deleted] = await db.delete(notes)
      .where(eq(notes.id, noteId))
      .returning();

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Note not found' }), {
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
  path: '/api/notes/:id',
};
