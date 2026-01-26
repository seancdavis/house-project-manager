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
      url: `/.netlify/images?url=/.netlify/blobs/${STORE_NAME}/${photo.blobKey}`,
    }));

    return new Response(JSON.stringify(photosWithUrls), { headers });
  }

  if (req.method === 'POST') {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const caption = formData.get('caption') as string | null;
      const uploadedById = formData.get('uploadedById') as string | null;

      if (!file) {
        return new Response(JSON.stringify({ error: 'File is required' }), {
          status: 400,
          headers
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }), {
          status: 400,
          headers
        });
      }

      // Generate unique blob key
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop() || 'jpg';
      const blobKey = `${projectId}/${timestamp}-${randomStr}.${extension}`;

      // Upload to Netlify Blobs
      const arrayBuffer = await file.arrayBuffer();
      await store.set(blobKey, arrayBuffer, {
        metadata: {
          contentType: file.type,
          originalFilename: file.name,
        }
      });

      // Save metadata to database
      const [newPhoto] = await db.insert(photos).values({
        projectId,
        blobKey,
        filename: file.name,
        caption: caption || null,
        mimeType: file.type,
        size: file.size,
        uploadedById: uploadedById || null,
      }).returning();

      return new Response(JSON.stringify({
        ...newPhoto,
        url: `/.netlify/images?url=/.netlify/blobs/${STORE_NAME}/${blobKey}`,
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
