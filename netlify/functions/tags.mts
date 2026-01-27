import type { Context } from '@netlify/functions';
import { asc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { tags } from '../../db/schema';

export default async (req: Request, _context: Context) => {
  const headers = { 'Content-Type': 'application/json' };

  try {
    if (req.method === 'GET') {
      const allTags = await db.select().from(tags).orderBy(asc(tags.name));
      return new Response(JSON.stringify(allTags), { headers });
    }

    if (req.method === 'POST') {
      const body = await req.json();

      if (!body.name || typeof body.name !== 'string') {
        return new Response(JSON.stringify({ error: 'Tag name required' }), {
          status: 400,
          headers
        });
      }

      // Normalize tag name (lowercase, trimmed)
      const normalizedName = body.name.trim().toLowerCase();

      try {
        const [newTag] = await db.insert(tags).values({
          name: normalizedName,
        }).returning();
        return new Response(JSON.stringify(newTag), { status: 201, headers });
      } catch (error: unknown) {
        // Handle unique constraint violation (tag already exists)
        if (error instanceof Error && error.message.includes('unique')) {
          // Return existing tag instead of error
          const [existing] = await db.select().from(tags).where(
            eq(tags.name, normalizedName)
          );
          if (existing) {
            return new Response(JSON.stringify(existing), { status: 200, headers });
          }
          return new Response(JSON.stringify({ error: 'Tag already exists' }), {
            status: 409,
            headers
          });
        }
        throw error;
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  } catch (error) {
    console.error('Tags API error:', error);
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
  path: '/api/tags',
};
