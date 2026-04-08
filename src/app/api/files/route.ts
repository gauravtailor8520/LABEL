// DELETE: Delete image and corresponding label file
// Move file to .trash for undo
async function moveToTrash(filePath: string, rootPath: string) {
  const trashDir = path.join(rootPath, '.trash');
  await fs.mkdir(trashDir, { recursive: true });
  const fileName = path.basename(filePath);
  const trashPath = path.join(trashDir, `${Date.now()}_${fileName}`);
  await fs.rename(filePath, trashPath);
  return trashPath;
}

// DELETE: Move image and label to .trash for undo
export async function DELETE(request: NextRequest) {
  try {
    const { imagePath, rootPath } = await request.json();
    if (!imagePath || !rootPath) {
      return NextResponse.json({ error: 'Missing imagePath or rootPath' }, { status: 400 });
    }

    // Move image file to .trash
    const trashedImagePath = await moveToTrash(imagePath, rootPath);

    // Find corresponding label file (same base name, .txt extension)
    const imageBase = path.basename(imagePath, path.extname(imagePath));
    let labelDir = path.join(rootPath, 'label');
    let labelPath = path.join(labelDir, imageBase + '.txt');
    let trashedLabelPath = null;
    let labelExists = false;
    try {
      await fs.access(labelPath);
      labelExists = true;
    } catch {
      labelDir = path.join(rootPath, 'labels');
      labelPath = path.join(labelDir, imageBase + '.txt');
      try {
        await fs.access(labelPath);
        labelExists = true;
      } catch {}
    }
    if (labelExists) {
      trashedLabelPath = await moveToTrash(labelPath, rootPath);
    }

    return NextResponse.json({ success: true, message: 'Image and label moved to trash.', trashedImagePath, trashedLabelPath, imagePath, labelPath });
  } catch (error: any) {
    console.error('Delete image/label error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete image/label' }, { status: 500 });
  }
}

// POST /api/files?action=restore : Restore trashed image/label
export async function PUT(request: NextRequest) {
  try {
    const { trashedImagePath, trashedLabelPath, imagePath, labelPath } = await request.json();
    // Restore image
    if (trashedImagePath && imagePath) {
      await fs.rename(trashedImagePath, imagePath);
    }
    // Restore label
    if (trashedLabelPath && labelPath) {
      await fs.rename(trashedLabelPath, labelPath);
    }
    return NextResponse.json({ success: true, message: 'Image and label restored.' });
  } catch (error: any) {
    console.error('Restore image/label error:', error);
    return NextResponse.json({ error: error.message || 'Failed to restore image/label' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// GET: List files or fetch specific file content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const rootPath = searchParams.get('path');
    
    if (!rootPath) {
      return NextResponse.json({ error: 'Missing root path' }, { status: 400 });
    }

    // Standardize path for Windows/Linux
    const normalizedRoot = path.normalize(rootPath);
    
    if (action === 'list') {
      try {
        await fs.access(normalizedRoot);
      } catch {
        return NextResponse.json({ error: `Root directory not found at: ${normalizedRoot}` }, { status: 404 });
      }

      // 1. Read notes.json (Categories)
      const notesPath = path.join(normalizedRoot, 'notes.json');
      let categories: any[] = [];
      try {
        const notesContent = await fs.readFile(notesPath, 'utf-8');
        const notesJson = JSON.parse(notesContent);
        categories = notesJson.categories || [];
      } catch (e) {
        console.warn('notes.json not found or invalid');
      }
      
      // 2. Find and Read images folder (check image/ or images/)
      let imageDirPath = path.join(normalizedRoot, 'image');
      const images: { name: string; path: string }[] = [];
      try {
        try {
          await fs.access(imageDirPath);
        } catch {
          imageDirPath = path.join(normalizedRoot, 'images');
          await fs.access(imageDirPath);
        }
        
        const imageEntries = await fs.readdir(imageDirPath, { withFileTypes: true });
        for (const entry of imageEntries) {
          if (entry.isFile() && isImageFile(entry.name)) {
            images.push({ 
              name: entry.name, 
              path: path.join(imageDirPath, entry.name) 
            });
          }
        }
      } catch (e) {
        console.warn('No image or images directory found');
      }
      
      // 3. Find and Read labels folder (check label/ or labels/)
      let labelDirPath = path.join(normalizedRoot, 'label');
      const labelFiles: { name: string; path: string }[] = [];
      try {
        try {
          await fs.access(labelDirPath);
        } catch {
          labelDirPath = path.join(normalizedRoot, 'labels');
          await fs.access(labelDirPath);
        }
        
        const labelEntries = await fs.readdir(labelDirPath, { withFileTypes: true });
        for (const entry of labelEntries) {
          if (entry.isFile() && entry.name.endsWith('.txt')) {
            labelFiles.push({ 
              name: entry.name, 
              path: path.join(labelDirPath, entry.name) 
            });
          }
        }
      } catch (e) {
        console.warn('No label or labels directory found');
      }
      
      if (images.length === 0) {
        console.warn('No images found in directories');
      }

      return NextResponse.json({ 
        categories, 
        images, 
        labelFiles,
        rootPath: normalizedRoot 
      });
    }
    
    if (action === 'image') {
      const imagePath = searchParams.get('path');
      if (!imagePath) return NextResponse.json({ error: 'Missing path' }, { status: 400 });
      
      const buffer = await fs.readFile(imagePath);
      const base64 = buffer.toString('base64');
      const ext = path.extname(imagePath).toLowerCase().slice(1);
      const mimeType = ext === 'jpg' ? 'jpeg' : ext;
      
      return NextResponse.json({
        dataUrl: `data:image/${mimeType};base64,${base64}`,
      });
    }

    if (action === 'labels') {
      const labelPath = searchParams.get('path');
      if (!labelPath) return NextResponse.json({ error: 'Missing path' }, { status: 400 });
      
      try {
        const content = await fs.readFile(labelPath, 'utf-8');
        const labels = parseYoloLabels(content);
        return NextResponse.json({ labels });
      } catch (e) {
        return NextResponse.json({ labels: [] });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Files API error:', error);
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// POST: Update project settings (categories)
export async function POST(request: NextRequest) {
  try {
    const { rootPath, categories } = await request.json();
    
    if (!rootPath || !categories) {
      return NextResponse.json({ error: 'Missing rootPath or categories' }, { status: 400 });
    }

    const normalizedRoot = path.normalize(rootPath);
    const notesPath = path.join(normalizedRoot, 'notes.json');
    
    await fs.writeFile(notesPath, JSON.stringify({ categories }, null, 2));
    
    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}

function isImageFile(fileName: string): boolean {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
}

function parseYoloLabels(content: string): any[] {
  const lines = content.trim().split('\n');
  const labels: any[] = [];
  
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5) {
      labels.push({
        id: uuidv4(),
        classId: parseInt(parts[0]),
        xCenter: parseFloat(parts[1]),
        yCenter: parseFloat(parts[2]),
        width: parseFloat(parts[3]),
        height: parseFloat(parts[4]),
      });
    }
  }
  
  return labels;
}

