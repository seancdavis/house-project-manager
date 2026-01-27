import type { Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { photos } from '../../db/schema';

const STORE_NAME = 'project-photos';

export default async (req: Request, context: Context) => {
  const headers = { 'Content-Type': 'application/json' };
  const projectId = context.params.projectId;

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Project ID required' }), {
      status: 400,
      headers
    });
  }

  const store = getStore(STORE_NAME);

  if (req.method === 'GET') {
    // Get all photos for a project
    const projectPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.projectId, projectId))
      .orderBy(desc(photos.createdAt));

    // Add URLs for each photo
    const photosWithUrls = projectPhotos.map(photo => ({
      ...photo,
      url: `/api/photos/${photo.id}/image`,
    }));

    return new Response(JSON.stringify(photosWithUrls), { headers });
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { file: base64File, filename, mimeType, size, caption, uploadedById } = body;

      if (!base64File || !filename || !mimeType) {
        return new Response(JSON.stringify({ error: 'File, filename, and mimeType are required' }), {
          status: 400,
          headers
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(mimeType)) {
        return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }), {
          status: 400,
          headers
        });
      }

      // Generate unique blob key
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extension = filename.split('.').pop() || 'jpg';
      const blobKey = `${projectId}/${timestamp}-${randomStr}.${extension}`;

      // Decode base64 to buffer
      const buffer = Buffer.from(base64File, 'base64');

      // Upload to Netlify Blobs
      await store.set(blobKey, buffer, {
        metadata: {
          contentType: mimeType,
          originalFilename: filename,
        }
      });

      // Save metadata to database
      const [newPhoto] = await db.insert(photos).values({
        projectId,
        blobKey,
        filename,
        caption: caption || null,
        mimeType,
        size: size || buffer.length,
        uploadedById: uploadedById || null,
      }).returning();

      return new Response(JSON.stringify({
        ...newPhoto,
        url: `/api/photos/${newPhoto.id}/image`,
      }), {
        status: 201,
        headers
      });
    } catch (error) {
      console.error('Upload error:', error);
      return new Response(JSON.stringify({ error: 'Upload failed' }), {
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
  path: '/api/projects/:projectId/photos',
};
