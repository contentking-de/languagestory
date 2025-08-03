import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getUserWithTeamData } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { media_files } from '@/lib/db/content-schema';

function getFileCategory(type: string): string {
  if (type.startsWith('image/')) return 'images';
  if (type.startsWith('audio/')) return 'audio';
  if (type.startsWith('video/')) return 'video';
  if (type === 'application/pdf') return 'documents';
  return 'other';
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserWithTeamData();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 200MB)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 200MB' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/webm',
      'application/pdf',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Save file metadata to database
    const blobId = blob.url.split('/').pop()?.split('?')[0] || filename;
    const category = getFileCategory(file.type);
    
    const [mediaFile] = await db.insert(media_files).values({
      blob_id: blobId,
      name: file.name,
      url: blob.url,
      size: file.size,
      type: file.type,
      category: category,
      uploaded_by: user.id,
      tags: [],
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      }
    }).returning();

    return NextResponse.json({
      id: mediaFile.id,
      blob_id: mediaFile.blob_id,
      url: mediaFile.url,
      size: mediaFile.size,
      type: mediaFile.type,
      name: mediaFile.name,
      category: mediaFile.category
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
} 