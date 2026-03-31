// YOLO Label Editor Types

export interface Category {
  id: number;
  name: string;
  color?: string;
}

export interface NodeJson {
  categories: Category[];
  info: {
    year: number;
    version: string;
    contributor: string;
  };
}

export interface YoloLabel {
  id: string;
  classId: number;
  xCenter: number; // Normalized 0-1
  yCenter: number; // Normalized 0-1
  width: number;   // Normalized 0-1
  height: number;  // Normalized 0-1
}

export interface ImageFile {
  name: string;
  path: string;
  dataUrl?: string;
}

export interface LabelFile {
  name: string;
  path: string;
  labels: YoloLabel[];
}

export interface ProjectData {
  categories: Category[];
  images: ImageFile[];
  labelFiles: LabelFile[];
  currentNode: number;
}

// Category colors for visualization
export const CATEGORY_COLORS: string[] = [
  '#FF6B6B', // Logo - Red
  '#4ECDC4', // QR - Teal
  '#45B7D1', // Signature - Blue
  '#96CEB4', // Stamp - Green
  '#FFEAA7', // Table - Yellow
  '#DDA0DD', // Text - Plum
  '#98D8C8', // Additional colors
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
];

export function getCategoryColor(classId: number, categories?: Category[]): string {
  if (categories) {
    const category = categories.find(c => c.id === classId);
    if (category?.color) return category.color;
  }
  return CATEGORY_COLORS[classId % CATEGORY_COLORS.length];
}
