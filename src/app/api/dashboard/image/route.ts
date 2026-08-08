import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imgPath = searchParams.get('path');
    if (!imgPath) {
      return new NextResponse('Missing path parameter', { status: 400 });
    }

    const normalizedPath = path.normalize(imgPath);
    try {
      await fs.access(normalizedPath);
    } catch {
      return new NextResponse('Image not found on disk', { status: 404 });
    }

    const buffer = await fs.readFile(normalizedPath);
    const ext = path.extname(normalizedPath).toLowerCase().slice(1);
    
    let mimeType = 'image/jpeg';
    if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'webp') mimeType = 'image/webp';
    else if (ext === 'svg') mimeType = 'image/svg+xml';
    else if (ext === 'gif') mimeType = 'image/gif';
    else if (ext === 'bmp') mimeType = 'image/bmp';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
    });
  } catch (error: any) {
    console.error('Binary image API error:', error);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
