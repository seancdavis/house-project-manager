import type { Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { members, activities } from '../../db/schema';

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

    // Record activity
    await db.insert(activities).values({
      action: 'updated',
      entityType: 'member',
      entityId: updated.id,
      entityTitle: updated.name,
      actorId: body.actorId || null,
    });

    return new Response(JSON.stringify(updated), { headers });
  }

  if (req.method === 'DELETE') {
    // Get member info before deletion for activity
    const [member] = await db.select().from(members).where(eq(members.id, id));
    if (!member) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
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

    await db.delete(members).where(eq(members.id, id));

    // Record activity
    await db.insert(activities).values({
      action: 'deleted',
      entityType: 'member',
      entityId: id,
      entityTitle: member.name,
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
  path: '/api/members/:id',
};
