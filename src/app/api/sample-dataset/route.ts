import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const SAMPLE_DATASET_NAME = 'sample-dataset';
const SAMPLE_DATASET_SOURCE_DIR = 'C:\\Users\\hp\\Downloads\\sample-dataset (2)\\sample-dataset';

export async function GET() {
  try {
    const sourceRoot = path.normalize(SAMPLE_DATASET_SOURCE_DIR);
    await fs.access(sourceRoot);

    const zip = new JSZip();
    const root = zip.folder(SAMPLE_DATASET_NAME);

    if (!root) {
      return NextResponse.json({ error: 'Failed to create sample archive' }, { status: 500 });
    }

    await addDirectoryToZip(root, sourceRoot);

    const archive = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(archive, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${SAMPLE_DATASET_NAME}.zip"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to read the sample dataset folder' },
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