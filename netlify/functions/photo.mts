import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { photos, projects, activities } from '../../db/schema';

const STORE_NAME = 'project-photos';

export default async (req: Request, context: Context) => {
  const headers = { 'Content-Type': 'application/json' };
  const photoId = context.params.id;

  if (!photoId) {
    return new Response(JSON.stringify({ error: 'Photo ID required' }), {
      status: 400,
      headers
    });
  }

  const store = getStore(STORE_NAME);

  if (req.method === 'DELETE') {
    // Get photo to find blob key
    const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));

    if (!photo) {
      return new Response(JSON.stringify({ error: 'Photo not found' }), {
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

    try {
      // Delete from Netlify Blobs
      await store.delete(photo.blobKey);

      // Delete from database
      await db.delete(photos).where(eq(photos.id, photoId));

      // Touch parent project's updatedAt
      await db.update(projects)
        .set({ updatedAt: new Date() })
        .where(eq(projects.id, photo.projectId));

      // Record activity
      await db.insert(activities).values({
        action: 'deleted',
        entityType: 'photo',
        entityId: photoId,
        entityTitle: photo.filename,
        projectId: photo.projectId,
        actorId,
      });

      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
      console.error('Delete error:', error);
      return new Response(JSON.stringify({ error: 'Delete failed' }), {
        status: 500,
        headers
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = await req.json();

      const [updated] = await db.update(photos)
        .set({
          caption: body.caption !== undefined ? body.caption : undefined,
          filename: body.filename !== undefined ? body.filename : undefined,
        })
        .where(eq(photos.id, photoId))
        .returning();

      if (!updated) {
        return new Response(JSON.stringify({ error: 'Photo not found' }), {
          status: 404,
          headers
        });
      }

      // Touch parent project's updatedAt
      await db.update(projects)
        .set({ updatedAt: new Date() })
        .where(eq(projects.id, updated.projectId));

      // Record activity
      await db.insert(activities).values({
        action: 'updated',
        entityType: 'photo',
        entityId: updated.id,
        entityTitle: updated.filename,
        projectId: updated.projectId,
        actorId: body.actorId || null,
      });

      return new Response(JSON.stringify({
        ...updated,
        url: `/api/photos/${updated.id}/image`,
      }), { headers });
    } catch (error) {
      console.error('Update error:', error);
      return new Response(JSON.stringify({ error: 'Update failed' }), {
        status: 500,
        headers
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers
  });
};

export const config = {
  path: '/api/photos/:id',
};
