import type { Context } from '@netlify/functions';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { activities, members, projects } from '../../db/schema';

export default async (req: Request, _context: Context) => {
  const headers = { 'Content-Type': 'application/json' };
  const url = new URL(req.url);

  try {
    if (req.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const projectId = url.searchParams.get('projectId');

      // Build query
      let query = db
        .select({
          id: activities.id,
          action: activities.action,
          entityType: activities.entityType,
          entityId: activities.entityId,
          entityTitle: activities.entityTitle,
          projectId: activities.projectId,
          actorId: activities.actorId,
          metadata: activities.metadata,
          createdAt: activities.createdAt,
          actorName: members.name,
          actorInitials: members.initials,
          actorColor: members.color,
          projectTitle: projects.title,
        })
        .from(activities)
        .leftJoin(members, eq(activities.actorId, members.id))
        .leftJoin(projects, eq(activities.projectId, projects.id))
        .orderBy(desc(activities.createdAt))
        .limit(limit);

      if (projectId) {
        query = query.where(eq(activities.projectId, projectId)) as typeof query;
      }

      const results = await query;

      // Transform to include nested objects
      const activitiesWithRelations = results.map(row => ({
        id: row.id,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        entityTitle: row.entityTitle,
        projectId: row.projectId,
        actorId: row.actorId,
        metadata: row.metadata,
        createdAt: row.createdAt,
        actor: row.actorId ? {
          id: row.actorId,
          name: row.actorName,
          initials: row.actorInitials,
          color: row.actorColor,
        } : null,
        project: row.projectId ? {
          id: row.projectId,
          title: row.projectTitle,
        } : null,
      }));

      return new Response(JSON.stringify(activitiesWithRelations), { headers });
    }

    if (req.method === 'POST') {
      const body = await req.json();

      if (!body.action || !body.entityType) {
        return new Response(JSON.stringify({ error: 'action and entityType required' }), {
          status: 400,
          headers
        });
      }

      const [newActivity] = await db.insert(activities).values({
        action: body.action,
        entityType: body.entityType,
        entityId: body.entityId || null,
        entityTitle: body.entityTitle || null,
        projectId: body.projectId || null,
        actorId: body.actorId || null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      }).returning();

      return new Response(JSON.stringify(newActivity), { status: 201, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });
  } catch (error) {
    console.error('Activities API error:', error);
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
  path: '/api/activities',
};
