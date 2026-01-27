import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { photos } from '../../db/schema';

const STORE_NAME = 'project-photos';

export default async (req: Request, context: Context) => {
  const photoId = context.params.id;

  if (!photoId) {
    return new Response('Photo ID required', { status: 400 });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Get photo metadata from database
    const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));

    if (!photo) {
      return new Response('Photo not found', { status: 404 });
    }

    // Get the blob
    const store = getStore(STORE_NAME);
    const blob = await store.get(photo.blobKey, { type: 'arrayBuffer' });

    if (!blob) {
      return new Response('Image not found', { status: 404 });
    }

    // Return the image with proper content type
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': photo.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new Response('Error serving image', { status: 500 });
  }
};

export const config = {
  path: '/api/photos/:id/image',
};
