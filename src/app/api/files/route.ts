import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';

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

    // Resolve actual image and label directory names dynamically (support both plural and singular)
    let actualImageDir = 'images';
    let imageDirExists = false;
    try {
      await fs.access(path.join(normalizedRoot, 'images'));
      imageDirExists = true;
    } catch {
      try {
        await fs.access(path.join(normalizedRoot, 'image'));
        actualImageDir = 'image';
        imageDirExists = true;
      } catch {}
    }

    let actualLabelDir = 'labels';
    let labelDirExists = false;
    try {
      await fs.access(path.join(normalizedRoot, 'labels'));
      labelDirExists = true;
    } catch {
      try {
        await fs.access(path.join(normalizedRoot, 'label'));
        actualLabelDir = 'label';
        labelDirExists = true;
      } catch {}
    }
    
    if (action === 'validate') {
      try {
        await fs.access(normalizedRoot);
      } catch {
        return NextResponse.json({ valid: false, dirNotFound: true, missing: [] });
      }

      // Check existence of classes.json strictly
      const classesPath = path.join(normalizedRoot, 'classes.json');
      let categoriesExist = false;
      try {
        await fs.access(classesPath);
        categoriesExist = true;
      } catch {
        categoriesExist = false;
      }

      const missingComponents: string[] = [];
      if (!categoriesExist) missingComponents.push('classes.json');
      if (!imageDirExists) missingComponents.push('images/');
      if (!labelDirExists) missingComponents.push('labels/');

      return NextResponse.json({
        valid: missingComponents.length === 0,
        dirNotFound: false,
        missing: missingComponents
      });
    }

    if (action === 'list') {
      try {
        await fs.access(normalizedRoot);
      } catch {
        return NextResponse.json({ error: `Root directory not found at: ${normalizedRoot}` }, { status: 404 });
      }

      // Check existence of classes.json strictly
      const classesPath = path.join(normalizedRoot, 'classes.json');
      let categoriesExist = false;
      try {
        await fs.access(classesPath);
        categoriesExist = true;
      } catch {
        categoriesExist = false;
      }

      const missingComponents: string[] = [];
      if (!categoriesExist) missingComponents.push('classes.json');
      if (!imageDirExists) missingComponents.push('images/');
      if (!labelDirExists) missingComponents.push('labels/');

      if (missingComponents.length > 0) {
        let errorMsg = '';
        if (missingComponents.length === 1) {
          const item = missingComponents[0];
          if (item === 'classes.json') {
            errorMsg = 'The `classes.json` file was not found in the selected dataset path. Please create it before continuing.';
          } else if (item === 'images/') {
            errorMsg = 'The `images` directory was not found in the selected dataset path. Please create it before continuing.';
          } else if (item === 'labels/') {
            errorMsg = 'The `labels` directory was not found in the selected dataset path. Please create it before continuing.';
          }
        } else {
          errorMsg = `The selected dataset is incomplete.\n\nMissing:\n${missingComponents.map(item => `* \`${item}\``).join('\n')}\n\nPlease create the missing items before creating the project.`;
        }

        return NextResponse.json({
          error: errorMsg,
          missing: missingComponents
        }, { status: 400 });
      }

      // 1. Read classes.json (Categories)
      let categories: any[] = [];
      try {
        const classesContent = await fs.readFile(classesPath, 'utf-8');
        const classesJson = JSON.parse(classesContent);
        categories = classesJson.categories || [];
      } catch (e) {
        console.warn('classes.json not found or invalid');
      }
      
      // 2. Find and Read images folder (check images/)
      let imageDirPath = path.join(normalizedRoot, actualImageDir);
      const images: { name: string; path: string }[] = [];
      try {
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
        console.warn('No images directory found');
      }
      
      // 3. Find and Read labels folder (check labels/)
      let labelDirPath = path.join(normalizedRoot, actualLabelDir);
      const labelFiles: { name: string; path: string; size: number }[] = [];
      try {
        const labelEntries = await fs.readdir(labelDirPath, { withFileTypes: true });
        for (const entry of labelEntries) {
          if (entry.isFile() && entry.name.endsWith('.txt') && entry.name.toLowerCase() !== 'classes.txt') {
            const filePath = path.join(labelDirPath, entry.name);
            let size = 0;
            try {
              const stat = await fs.stat(filePath);
              size = stat.size;
            } catch {}
            labelFiles.push({ 
              name: entry.name, 
              path: filePath,
              size
            });
          }
        }
      } catch (e) {
        console.warn('No labels directory found');
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
      const mimeType = ext === 'jpg' ? 'jpeg' : ext === 'svg' ? 'svg+xml' : ext;
      
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

    if (action === 'export') {
      try {
        await fs.access(normalizedRoot);
      } catch {
        return NextResponse.json({ error: `Root directory not found at: ${normalizedRoot}` }, { status: 404 });
      }

      const projectNameParam = searchParams.get('projectName') || 'LABEL-Project';
      const cleanProjectName = projectNameParam.replace(/[\\/:*?"<>|]/g, '_').trim();
      const zipFileName = `${cleanProjectName}-LABEL.zip`;

      const zip = new JSZip();

      // 1. Add classes.json if it exists
      const classesPath = path.join(normalizedRoot, 'classes.json');
      try {
        await fs.access(classesPath);
        const classesContent = await fs.readFile(classesPath);
        zip.file('classes.json', classesContent);
      } catch (e) {
        console.warn('classes.json not found during export');
      }

      // 2. Add images directory if it exists
      const imagesDirPath = path.join(normalizedRoot, actualImageDir);
      try {
        await fs.access(imagesDirPath);
        const imagesFolder = zip.folder(actualImageDir);
        if (imagesFolder) {
          await addDirectoryToZip(imagesFolder, imagesDirPath);
        }
      } catch (e) {
        console.warn('images directory not found during export');
      }

      // 3. Add labels directory if it exists
      const labelsDirPath = path.join(normalizedRoot, actualLabelDir);
      try {
        await fs.access(labelsDirPath);
        const labelsFolder = zip.folder(actualLabelDir);
        if (labelsFolder) {
          await addDirectoryToZip(labelsFolder, labelsDirPath);
        }
      } catch (e) {
        console.warn('labels directory not found during export');
      }

      const archive = await zip.generateAsync({ type: 'nodebuffer' });

      return new NextResponse(archive, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${zipFileName}"`,
        },
      });
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
    const classesPath = path.join(normalizedRoot, 'classes.json');
    
    await fs.writeFile(classesPath, JSON.stringify({ categories }, null, 2));
    
    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an image and its corresponding label file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('imagePath');
    const labelPath = searchParams.get('labelPath');

    if (!imagePath && !labelPath) {
      return NextResponse.json({ error: 'Missing image or label path' }, { status: 400 });
    }

    // 1. Delete the image file if path is specified
    if (imagePath) {
      try {
        await fs.unlink(imagePath);

        // Automatically delete corresponding label .txt file on disk
        if (!labelPath) {
          const parsed = path.parse(imagePath);
          // Check same directory .txt
          const sameDirLabel = path.join(parsed.dir, `${parsed.name}.txt`);
          try {
            await fs.unlink(sameDirLabel);
          } catch (e) { }

          // Check parallel /labels directory .txt (e.g. dataset/images/01.jpg -> dataset/labels/01.txt)
          if (parsed.dir.toLowerCase().includes('images')) {
            const labelsDir = parsed.dir.replace(/images$/i, 'labels').replace(/images([/\\])/i, 'labels$1');
            const parallelLabel = path.join(labelsDir, `${parsed.name}.txt`);
            try {
              await fs.unlink(parallelLabel);
            } catch (e) { }
          }
        }
      } catch (e: any) {
        console.warn(`Could not delete image file at ${imagePath}:`, e.message);
      }
    }

    // 2. Delete label file if path is explicitly specified
    if (labelPath) {
      try {
        await fs.unlink(labelPath);
      } catch (e: any) {
        console.warn(`Could not delete label file at ${labelPath}:`, e.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Image and labels deleted successfully' });
  } catch (error: any) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: error.message || 'Deletion failed' },
      { status: 500 }
    );
  }
}

function isImageFile(fileName: string): boolean {
  const ext = fileName.trim().toLowerCase().split('.').pop()?.trim() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'jfif', 'tiff', 'tif', 'heic', 'heif'].includes(ext);
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

async function addDirectoryToZip(zipFolder: JSZip, sourceDir: string) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      const childFolder = zipFolder.folder(entry.name);

      if (childFolder) {
        await addDirectoryToZip(childFolder, sourcePath);
      }

      continue;
    }

    if (entry.isFile()) {
      const fileBuffer = await fs.readFile(sourcePath);
      zipFolder.file(entry.name, fileBuffer);
    }
  }
}

