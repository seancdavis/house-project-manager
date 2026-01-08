import type { Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { members } from '../../db/schema';

export default async (req: Request, context: Context) => {
  const headers = { 'Content-Type': 'application/json' };
  const id = context.params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Member ID required' }), {
      status: 400,
      headers
    });
  }

  if (req.method === 'GET') {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    if (!member) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
        status: 404,
        headers
      });
    }
    return new Response(JSON.stringify(member), { headers });
  }

  if (req.method === 'PUT') {
    const body = await req.json();
    const [updated] = await db.update(members)
      .set({
        name: body.name,
        type: body.type,
        initials: body.initials,
        color: body.color,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
        status: 404,
        headers
      });
    }
    return new Response(JSON.stringify(updated), { headers });
  }

  if (req.method === 'DELETE') {
    const [deleted] = await db.delete(members)
      .where(eq(members.id, id))
      .returning();

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
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
  path: '/api/members/:id',
};
