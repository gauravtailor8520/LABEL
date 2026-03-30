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
