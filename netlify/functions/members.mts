import type { Context } from '@netlify/functions';
import { db } from '../../db';
import { members } from '../../db/schema';

export default async (req: Request, _context: Context) => {
  const headers = { 'Content-Type': 'application/json' };

  try {
    if (req.method === 'GET') {
      const allMembers = await db.select().from(members).orderBy(members.name);
      return new Response(JSON.stringify(allMembers), { headers });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const [newMember] = await db.insert(members).values({
        name: body.name,
        type: body.type,
        initials: body.initials,
        color: body.color,
      }).returning();
      return new Response(JSON.stringify(newMember), { status: 201, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  } catch (error) {
    console.error('Members API error:', error);
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
  path: '/api/members',
};
