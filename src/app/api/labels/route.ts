import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { YoloLabel } from '@/lib/types';

// Save labels to file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, labels } = body as { filePath: string; labels: YoloLabel[] };
    
    if (!filePath || !labels) {
      return NextResponse.json(
        { error: 'Missing filePath or labels' },
        { status: 400 }
      );
    }
    
    // Convert labels to YOLO format
    const yoloContent = labels
      .map((label) => {
        return `${label.classId} ${label.xCenter.toFixed(6)} ${label.yCenter.toFixed(6)} ${label.width.toFixed(6)} ${label.height.toFixed(6)}`;
      })
      .join('\n');
    
    await fs.writeFile(filePath, yoloContent);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Labels saved successfully',
      labelCount: labels.length,
    });
  } catch (error: any) {
    console.error('Save labels error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save labels' },
      { status: 500 }
    );
  }
}

// Load labels from file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'Missing filePath parameter' },
        { status: 400 }
      );
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    const labels = parseYoloLabels(content);
    
    return NextResponse.json({ labels });
  } catch (error: any) {
    console.error('Load labels error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load labels' },
      { status: 500 }
    );
  }
}

function parseYoloLabels(content: string): YoloLabel[] {
  const lines = content.trim().split('\n');
  const labels: YoloLabel[] = [];
  
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

// Delete a specific label match from file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');
    const classIdStr = searchParams.get('classId');
    const xStr = searchParams.get('x');
    const yStr = searchParams.get('y');
    const wStr = searchParams.get('w');
    const hStr = searchParams.get('h');

    if (!filePath || classIdStr === null || !xStr || !yStr || !wStr || !hStr) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const classId = parseInt(classIdStr);
    const targetX = parseFloat(xStr);
    const targetY = parseFloat(yStr);
    const targetW = parseFloat(wStr);
    const targetH = parseFloat(hStr);

    // Read existing file
    let content = "";
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (e) {
      return NextResponse.json({ error: 'Label file not found' }, { status: 404 });
    }

    const lines = content.split('\n');
    let deletedCount = 0;

    const remainingLines = lines.filter(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const cid = parseInt(parts[0]);
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const w = parseFloat(parts[3]);
        const h = parseFloat(parts[4]);

        const matchCid = cid === classId;
        const matchX = Math.abs(x - targetX) < 0.0001;
        const matchY = Math.abs(y - targetY) < 0.0001;
        const matchW = Math.abs(w - targetW) < 0.0001;
        const matchH = Math.abs(h - targetH) < 0.0001;

        if (matchCid && matchX && matchY && matchW && matchH) {
          deletedCount++;
          return false; // exclude this label
        }
      }
      return true; // keep label
    });

    if (deletedCount > 0) {
      const newContent = remainingLines.join('\n').trim();
      if (newContent === '') {
        await fs.writeFile(filePath, ''); // empty file content
      } else {
        await fs.writeFile(filePath, newContent + '\n');
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deletedCount} extra label(s).`,
      deletedCount
    });
  } catch (error: any) {
    console.error('Delete extra label error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete extra label' },
      { status: 500 }
    );
  }
}
