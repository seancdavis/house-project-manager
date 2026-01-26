import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { photos } from '../../db/schema';

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

    try {
      // Delete from Netlify Blobs
      await store.delete(photo.blobKey);

      // Delete from database
      await db.delete(photos).where(eq(photos.id, photoId));

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
        })
        .where(eq(photos.id, photoId))
        .returning();

      if (!updated) {
        return new Response(JSON.stringify({ error: 'Photo not found' }), {
          status: 404,
          headers
        });
      }

      return new Response(JSON.stringify({
        ...updated,
        url: `/.netlify/images?url=/.netlify/blobs/${STORE_NAME}/${updated.blobKey}`,
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
