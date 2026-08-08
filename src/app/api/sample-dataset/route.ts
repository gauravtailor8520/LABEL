import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const SAMPLE_DATASET_NAME = 'sample-dataset';
const SAMPLE_DATASET_SOURCE_DIR = 'C:\\Users\\hp\\Downloads\\sample-dataset (2)\\sample-dataset';

export async function GET() {
  // 1. Try to serve the pre-packaged zip in the workspace root if it exists
  try {
    const prebuiltZipPath = path.join(process.cwd(), 'sample-dataset.zip');
    await fs.access(prebuiltZipPath);
    const fileBuffer = await fs.readFile(prebuiltZipPath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="sample-dataset.zip"`,
      },
    });
  } catch (err) {
    console.log('Prebuilt sample-dataset.zip not found or inaccessible, trying source folder...');
  }

  // 2. Try the original source directory fallback (building from local folder)
  try {
    const sourceRoot = path.normalize(SAMPLE_DATASET_SOURCE_DIR);
    await fs.access(sourceRoot);

    const zip = new JSZip();
    const root = zip.folder(SAMPLE_DATASET_NAME);

    if (root) {
      await addDirectoryToZip(root, sourceRoot);
      const archive = await zip.generateAsync({ type: 'nodebuffer' });

      return new NextResponse(archive, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${SAMPLE_DATASET_NAME}.zip"`,
        },
      });
    }
  } catch (err) {
    console.log('Source directory not found, falling back to programmatic sample dataset generation...');
  }

  // 3. Fallback: Programmatically generate a complete, valid sample dataset zip
  try {
    const zip = new JSZip();
    const root = zip.folder(SAMPLE_DATASET_NAME);

    if (!root) {
      throw new Error('Failed to create programmatic zip folder');
    }

    // A. Add classes.json
    const classesJson = {
      categories: [
        { id: 0, name: "header_logo", color: "#FC7603" },
        { id: 1, name: "invoice_number", color: "#C31230" },
        { id: 2, name: "billing_address", color: "#22C55E" },
        { id: 3, name: "line_item", color: "#3B82F6" },
        { id: 4, name: "total_amount", color: "#A855F7" }
      ]
    };
    root.file('classes.json', JSON.stringify(classesJson, null, 2));

    // B. Add sample image (1x1 transparent GIF buffer in base64)
    const base64Image = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const imageFolder = root.folder('image');
    if (imageFolder) {
      imageFolder.file('sample_image.gif', imageBuffer);
    }

    // C. Add matching sample label txt file with 1 mock bounding box (class 0, center)
    const labelFolder = root.folder('label');
    if (labelFolder) {
      labelFolder.file('sample_image.txt', '0 0.5 0.5 0.3 0.2\n');
    }

    const archive = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(archive, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${SAMPLE_DATASET_NAME}.zip"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate the sample dataset' },
      { status: 500 },
    );
  }
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