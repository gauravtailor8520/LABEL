'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Upload,
  Undo2,
  Redo2,
  Save,
  Download,
  Trash2,
  Plus,
  ZoomIn,
  ZoomOut,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  MousePointer,
  Square,
  Check,
  LayoutDashboard,
  Search,
  RefreshCw,
  Palette,
  X,
  RotateCcw,
} from 'lucide-react';
import { useLabelStore } from '@/store/labelStore';
import { Category, YoloLabel, getCategoryColor, CATEGORY_COLORS } from '@/lib/types';
import { toast } from 'sonner';
import YoloDashboard from '@/components/YoloDashboard';

export default function YoloLabelEditor() {
  const [showDashboard, setShowDashboard] = useState(false);
  const {
    categories,
    setCategories,
    currentImageName,
    currentImageData,
    setCurrentImage,
    labels,
    setLabels,
    selectedLabelIds,
    setSelectedLabelIds,
    undo,
    redo,
    canUndo,
    canRedo,
    addLabel,
    updateLabel,
    deleteLabel,
    saveToHistory,
    currentLabelFilePath,
    setCurrentLabelFilePath,
    isModified,
    setIsModified,
    rootPath,
    setRootPath,
    autoSave,
    setAutoSave,
    updateCategoryColor,
    reset,
  } = useLabelStore();

  const [localPath, setLocalPath] = useState(rootPath || '');

  const [images, setImages] = useState<{ name: string; path: string }[]>([]);
  const [copiedLabels, setCopiedLabels] = useState<Partial<YoloLabel>[]>([]);
  const [labelFiles, setLabelFiles] = useState<{ name: string; path: string; size?: number }[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [zoomInput, setZoomInput] = useState('100%');

  useEffect(() => {
    setZoomInput(`${Math.round(zoom * 100)}%`);
  }, [zoom]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [newLabelClass, setNewLabelClass] = useState<number | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    naturalWidth: number;
    naturalHeight: number;
    displayWidth: number;
    displayHeight: number;
    offsetX: number;
    offsetY: number;
    scale: number;
  } | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [showUpload, setShowUpload] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);
  const [rightSearchQuery, setRightSearchQuery] = useState('');
  const [rightFilter, setRightFilter] = useState<'all' | 'labeled' | 'unlabeled'>('all');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isDeleteSelectOpen, setIsDeleteSelectOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nodeJsonInputRef = useRef<HTMLInputElement>(null);

  // Update dimensions
  const updateDimensions = useCallback(() => {
    if (!imageRef.current || !canvasRef.current || !imageRef.current.naturalWidth) return;

    const img = imageRef.current;
    const container = canvasRef.current;

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scaleX = containerWidth / naturalWidth;
    const scaleY = containerHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY) * zoom;

    const displayWidth = naturalWidth * scale;
    const displayHeight = naturalHeight * scale;

    const offsetX = (containerWidth - displayWidth) / 2 + panOffset.x;
    const offsetY = (containerHeight - displayHeight) / 2 + panOffset.y;

    setImageMeta({
      naturalWidth,
      naturalHeight,
      displayWidth,
      displayHeight,
      offsetX,
      offsetY,
      scale,
    });
  }, [zoom, panOffset]);

  // Convert screen coordinates to normalized YOLO coordinates
  const screenToNormalized = useCallback((screenX: number, screenY: number) => {
    if (!imageMeta) return null;
    const x = (screenX - imageMeta.offsetX) / imageMeta.displayWidth;
    const y = (screenY - imageMeta.offsetY) / imageMeta.displayHeight;
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
  }, [imageMeta]);

  // Convert normalized YOLO coordinates to screen coordinates
  const normalizedToScreen = useCallback((normX: number, normY: number) => {
    if (!imageMeta) return null;
    return {
      x: normX * imageMeta.displayWidth + imageMeta.offsetX,
      y: normY * imageMeta.displayHeight + imageMeta.offsetY,
    };
  }, [imageMeta]);

  // Handle directory load
  const handleLoadDirectory = async () => {
    if (!localPath) {
      toast.error('Please enter a directory path');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/files?action=list&path=${encodeURIComponent(localPath)}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setCategories(data.categories || []);
      setImages(data.images || []);
      setLabelFiles(data.labelFiles || []);
      setRootPath(data.rootPath);

      if (data.images.length > 0) {
        setShowUpload(false);
        load_image_(0, data.images, data.labelFiles);
      } else {
        toast.info('No images found in the /image folder');
      }

      toast.success(`Successfully loaded directory: ${data.rootPath}`);
    } catch (error: any) {
      toast.error(`Load failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshDirectory = async () => {
    const targetPath = rootPath || localPath;
    if (!targetPath) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/files?action=list&path=${encodeURIComponent(targetPath)}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setCategories(data.categories || []);
      setImages(data.images || []);
      setLabelFiles(data.labelFiles || []);

      if (data.images.length > 0) {
        const nextIndex = currentImageIndex >= 0 && currentImageIndex < data.images.length ? currentImageIndex : 0;
        load_image_(nextIndex, data.images, data.labelFiles);
      }

      toast.success('Refreshed dataset files list');
    } catch (error: any) {
      toast.error(`Refresh failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSampleDataset = async () => {
    setIsDownloadingSample(true);

    try {
      const response = await fetch('/api/sample-dataset');

      if (!response.ok) {
        throw new Error('Unable to build the sample dataset');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = downloadUrl;
      anchor.download = 'sample-dataset.zip';
      anchor.click();

      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Sample dataset download started');
    } catch (error: any) {
      toast.error(`Download failed: ${error.message}`);
    } finally {
      setIsDownloadingSample(false);
    }
  };

  // Load image by index
  const load_image_ = async (index: number, imageList?: typeof images, labelList?: typeof labelFiles) => {
    const imgs = imageList || images;
    const lbls = labelList || labelFiles;

    if (index < 0 || index >= imgs.length) return;

    const img = imgs[index];
    setCurrentImageIndex(index);
    setIsLoading(true);

    try {
      // 1. Fetch image data URL from server
      const imgRes = await fetch(`/api/files?action=image&path=${encodeURIComponent(img.path)}`);
      const imgData = await imgRes.json();

      setCurrentImage(img.name, imgData.dataUrl);

      // 2. Fetch/Parse corresponding label file from disk
      const baseName = img.name.replace(/\.[^/.]+$/, '');
      const labelFile = lbls.find(lf => lf.name.replace(/\.[^/.]+$/, '') === baseName);

      if (labelFile) {
        const lblRes = await fetch(`/api/files?action=labels&path=${encodeURIComponent(labelFile.path)}`);
        const lblData = await lblRes.json();
        setLabels(lblData.labels || []);
        setCurrentLabelFilePath(labelFile.path);
      } else {
        // Create expected label path if it doesn't exist
        const expectedLabelPath = rootPath ? `${rootPath}${rootPath.includes('\\') ? '\\' : '/'}label${rootPath.includes('\\') ? '\\' : '/'}${baseName}.txt` : null;
        setLabels([]);
        setCurrentLabelFilePath(expectedLabelPath);
      }
    } catch (e: any) {
      toast.error(`Failed to load image: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse YOLO format labels
  const parseYoloLabels = (content: string): YoloLabel[] => {
    const lines = content.trim().split('\n');
    const parsedLabels: YoloLabel[] = [];

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        parsedLabels.push({
          id: crypto.randomUUID(),
          classId: parseInt(parts[0]),
          xCenter: parseFloat(parts[1]),
          yCenter: parseFloat(parts[2]),
          width: parseFloat(parts[3]),
          height: parseFloat(parts[4]),
        });
      }
    }

    return parsedLabels;
  };

  // Read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    const delta = -e.deltaY;
    const zoomStep = 0.05;
    const newZoom = delta > 0
      ? Math.min(Math.max(zoom + zoomStep, 0.5), 5)
      : Math.max(Math.min(zoom - zoomStep, 5), 0.5);

    if (newZoom !== zoom) {
      setZoom(newZoom);
    }
  };

  // Handle canvas mouse down
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Pan with Left Click if NOT in drawing mode, or always with Right Click
    const isLeftClick = e.button === 0;
    const isRightClick = e.button === 2;

    // Clear selection if clicking the background
    setSelectedLabelIds([]);
    if (newLabelClass === null) {
      setNewLabelClass(null);
    }

    if (isRightClick || (isLeftClick && newLabelClass === null)) {
      e.preventDefault();
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (newLabelClass === null) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalized = screenToNormalized(x, y);
    if (!normalized) return;

    setIsDrawing(true);
    setDrawStart(normalized);

    // Create new temporary label
    const newLabel: YoloLabel = {
      id: 'temp-new',
      classId: newLabelClass,
      xCenter: normalized.x,
      yCenter: normalized.y,
      width: 0,
      height: 0,
    };

    setLabels([...labels, newLabel]);
  };

  // Handle canvas mouse move
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing) {
      const normalized = screenToNormalized(x, y);
      if (!normalized) return;

      const xCenter = (drawStart.x + normalized.x) / 2;
      const yCenter = (drawStart.y + normalized.y) / 2;
      const width = Math.abs(normalized.x - drawStart.x);
      const height = Math.abs(normalized.y - drawStart.y);

      updateLabel('temp-new', { xCenter, yCenter, width, height });
    } else if (isDragging && selectedLabelIds.length > 0) {
      // Dragging existing label (only support dragging one for now to keep it simple, or move all)
      const normalized = screenToNormalized(x, y);
      if (!normalized) return;

      const selectedId = selectedLabelIds[0]; // Drag the primarily selected or first one
      const label = labels.find(l => l.id === selectedId);
      if (label) {
        const dx = normalized.x - dragStart.x;
        const dy = normalized.y - dragStart.y;

        updateLabel(selectedId, {
          xCenter: Math.max(label.width / 2, Math.min(1 - label.width / 2, label.xCenter + dx)),
          yCenter: Math.max(label.height / 2, Math.min(1 - label.height / 2, label.yCenter + dy)),
        });

        setDragStart(normalized);
      }
    } else if (isResizing && selectedLabelIds.length > 0 && resizeHandle) {
      // Resizing existing label
      const normalized = screenToNormalized(x, y);
      if (!normalized) return;

      const selectedId = selectedLabelIds[0];
      const label = labels.find(l => l.id === selectedId);
      if (label) {
        let newWidth = label.width;
        let newHeight = label.height;
        let newXCenter = label.xCenter;
        let newYCenter = label.yCenter;

        const halfW = label.width / 2;
        const halfH = label.height / 2;

        if (resizeHandle.includes('e')) {
          const fixedLeft = label.xCenter - halfW;
          newWidth = Math.max(0.01, normalized.x - fixedLeft);
          newXCenter = fixedLeft + newWidth / 2;
        }
        if (resizeHandle.includes('w')) {
          const fixedRight = label.xCenter + halfW;
          newWidth = Math.max(0.01, fixedRight - normalized.x);
          newXCenter = fixedRight - newWidth / 2;
        }
        if (resizeHandle.includes('s')) {
          const fixedTop = label.yCenter - halfH;
          newHeight = Math.max(0.01, normalized.y - fixedTop);
          newYCenter = fixedTop + newHeight / 2;
        }
        if (resizeHandle.includes('n')) {
          const fixedBottom = label.yCenter + halfH;
          newHeight = Math.max(0.01, fixedBottom - normalized.y);
          newYCenter = fixedBottom - newHeight / 2;
        }

        updateLabel(selectedId, {
          xCenter: Math.max(0, Math.min(1, newXCenter)),
          yCenter: Math.max(0, Math.min(1, newYCenter)),
          width: Math.max(0, Math.min(1, newWidth)),
          height: Math.max(0, Math.min(1, newHeight)),
        });
      }
    }
  };

  // Handle canvas mouse up
  const handleCanvasMouseUp = () => {
    if (isDrawing && newLabelClass !== null) {
      const tempLabel = labels.find(l => l.id === 'temp-new');
      if (tempLabel && tempLabel.width > 0.01 && tempLabel.height > 0.01) {
        // Convert temp label to permanent
        const newLabel: YoloLabel = {
          ...tempLabel,
          id: crypto.randomUUID(),
        };
        deleteLabel('temp-new');
        addLabel(newLabel);
        setSelectedLabelIds([newLabel.id]);
      } else {
        deleteLabel('temp-new');
      }
      setNewLabelClass(null);
    }

    if ((isDragging || isResizing) && selectedLabelIds.length > 0) {
      saveToHistory();
    }

    setIsDrawing(false);
    setIsDragging(false);
    setIsResizing(false);
    setIsPanning(false);
    setResizeHandle(null);
  };

  // Handle label selection
  const handleLabelSelect = (labelId: string, isMulti: boolean = false) => {
    if (isMulti) {
      if (selectedLabelIds.includes(labelId)) {
        setSelectedLabelIds(selectedLabelIds.filter(id => id !== labelId));
      } else {
        setSelectedLabelIds([...selectedLabelIds, labelId]);
      }
    } else {
      setSelectedLabelIds(selectedLabelIds.includes(labelId) && selectedLabelIds.length === 1 ? [] : [labelId]);
    }
  };

  // Start drawing new label
  const startNewLabel = (classId: number) => {
    setNewLabelClass(classId);
    setSelectedLabelIds([]);
  };

  // Handle label box mouse down
  const handleLabelMouseDown = (e: React.MouseEvent, labelId: string, handle?: string) => {
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalized = screenToNormalized(x, y);
    if (!normalized) return;

    if (e.ctrlKey || e.metaKey) {
      handleLabelSelect(labelId, true);
    } else {
      if (!selectedLabelIds.includes(labelId)) {
        setSelectedLabelIds([labelId]);
      }
    }

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
      setDragStart(normalized);
    }
  };

  // Save labels
  const handleSave = async (showToast = true) => {
    if (!currentLabelFilePath) {
      if (showToast) toast.error('No output path defined');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: currentLabelFilePath,
          labels: labels.filter(l => l.id !== 'temp-new')
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setIsModified(false);
      if (showToast) toast.success('Labels saved directly to disk!');
    } catch (error: any) {
      if (showToast) toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCurrentImage = async () => {
    if (currentImageIndex < 0 || currentImageIndex >= images.length) return;
    const currentImage = images[currentImageIndex];

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the image "${currentImage.name}" and its associated label file? This action is permanent.`
    );

    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const baseName = currentImage.name.replace(/\.[^/.]+$/, '');
      const matchingLabel = labelFiles.find(lf => lf.name.replace(/\.[^/.]+$/, '') === baseName);

      const queryParams = new URLSearchParams({
        imagePath: currentImage.path
      });
      if (matchingLabel) {
        queryParams.append('labelPath', matchingLabel.path);
      }

      const res = await fetch(`/api/files?${queryParams.toString()}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('API delete call failed');

      toast.success(`Successfully deleted image ${currentImage.name}`);

      const updatedImages = images.filter((_, idx) => idx !== currentImageIndex);
      const updatedLabels = matchingLabel
        ? labelFiles.filter(lf => lf.path !== matchingLabel.path)
        : labelFiles;

      setImages(updatedImages);
      setLabelFiles(updatedLabels);

      if (updatedImages.length === 0) {
        setCurrentImageIndex(-1);
        setCurrentImage('', '');
        setLabels([]);
        setIsModified(false);
      } else {
        const nextIdx = Math.min(currentImageIndex, updatedImages.length - 1);
        setCurrentImageIndex(nextIdx);
        const nextImage = updatedImages[nextIdx];

        const imgRes = await fetch(`/api/files?action=image&path=${encodeURIComponent(nextImage.path)}`);
        const imgData = await imgRes.json();
        setCurrentImage(nextImage.name, imgData.dataUrl);
        setIsModified(false);

        const nextBaseName = nextImage.name.replace(/\.[^/.]+$/, '');
        const nextLabelFile = updatedLabels.find(lf => lf.name.replace(/\.[^/.]+$/, '') === nextBaseName);
        if (nextLabelFile) {
          const labelRes = await fetch(`/api/files?action=labels&path=${encodeURIComponent(nextLabelFile.path)}`);
          if (labelRes.ok) {
            const labelData = await labelRes.json();
            setLabels(labelData.labels || []);
            setCurrentLabelFilePath(nextLabelFile.path);
          } else {
            setLabels([]);
            setCurrentLabelFilePath(null);
          }
        } else {
          const expectedLabelPath = rootPath ? `${rootPath}${rootPath.includes('\\') ? '\\' : '/'}label${rootPath.includes('\\') ? '\\' : '/'}${nextBaseName}.txt` : null;
          setLabels([]);
          setCurrentLabelFilePath(expectedLabelPath);
        }
      }
    } catch (err: any) {
      toast.error(`Failed to delete image: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update Category Color
  const handleUpdateCategoryColor = async (id: number, color: string) => {
    updateCategoryColor(id, color);
    if (rootPath) {
      try {
        await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rootPath,
            categories: categories.map(c => c.id === id ? { ...c, color } : c)
          }),
        });
      } catch (e) {
        console.error('Failed to save category color', e);
      }
    }
  };

  const handleAddCategory = async () => {
    const name = window.prompt('Enter new class name:');
    if (!name || !name.trim()) return;

    const trimmedName = name.trim();
    if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error(`Class "${trimmedName}" already exists`);
      return;
    }

    const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 0;
    const defaultColor = CATEGORY_COLORS[nextId % CATEGORY_COLORS.length] || '#FC7603';
    const newCategory: Category = { id: nextId, name: trimmedName, color: defaultColor };
    const updatedCategories = [...categories, newCategory];

    setCategories(updatedCategories);
    toast.success(`Added class "${trimmedName}"`);

    if (rootPath) {
      try {
        await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rootPath,
            categories: updatedCategories
          }),
        });
      } catch (e) {
        console.error('Failed to save updated categories', e);
      }
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    // 1st Warning Confirmation
    const confirmFirst = window.confirm(
      `⚠️ WARNING: Are you sure you want to remove the class "${category.name}"?`
    );
    if (!confirmFirst) return;

    // 2nd Warning Confirmation (Double Ask)
    const confirmSecond = window.confirm(
      `🚨 FINAL WARNING: Deleting class "${category.name}" will permanently remove its definition and any associated labels. Continue?`
    );
    if (!confirmSecond) return;

    const updatedCategories = categories.filter(c => c.id !== category.id);
    setCategories(updatedCategories);

    // Remove labels using this classId
    const updatedLabels = labels.filter(l => l.classId !== category.id);
    setLabels(updatedLabels);
    saveToHistory(updatedLabels);
    setIsModified(true);

    if (newLabelClass === category.id) {
      setNewLabelClass(null);
    }

    toast.success(`Removed class "${category.name}"`);

    if (rootPath) {
      try {
        await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rootPath,
            categories: updatedCategories
          }),
        });
      } catch (e) {
        console.error('Failed to save updated categories', e);
      }
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (autoSave && isModified && currentLabelFilePath) {
      const timer = setTimeout(() => {
        handleSave(false);
      }, 1000); // 1-second debounce
      return () => clearTimeout(timer);
    }
  }, [labels, autoSave, isModified, currentLabelFilePath]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.ctrlKey && e.key === 'c') {
          // Copy selected labels
          if (selectedLabelIds.length > 0) {
            const selectedLabels = labels
              .filter(l => selectedLabelIds.includes(l.id))
              .map(l => ({
                classId: l.classId,
                width: l.width,
                height: l.height,
                xCenter: l.xCenter,
                yCenter: l.yCenter,
              }));
            setCopiedLabels(selectedLabels);
            toast.success(`${selectedLabels.length} labels copied`);
          }
        } else if (e.ctrlKey && e.key === 'v') {
          // Paste copied labels
          if (copiedLabels.length > 0) {
            const newIds: string[] = [];
            copiedLabels.forEach(copied => {
              const newLabel: YoloLabel = {
                id: crypto.randomUUID(),
                classId: copied.classId!,
                width: copied.width!,
                height: copied.height!,
                xCenter: Math.min(1, copied.xCenter! + 0.02),
                yCenter: Math.min(1, copied.yCenter! + 0.02),
              };
              addLabel(newLabel);
              newIds.push(newLabel.id);
            });
            setSelectedLabelIds(newIds);
            toast.success(`${copiedLabels.length} labels pasted`);
          }
        } else if (e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLabelIds.length > 0) {
          selectedLabelIds.forEach(id => deleteLabel(id));
          setSelectedLabelIds([]);
          toast.success(`${selectedLabelIds.length} labels deleted`);
        }
      }

      if (e.key === 'Escape') {
        setSelectedLabelIds([]);
        setNewLabelClass(null);
        if (labels.find(l => l.id === 'temp-new')) {
          deleteLabel('temp-new');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLabelIds, undo, redo, deleteLabel, labels, copiedLabels]);

  // Update canvas size on resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
      }
    };

    updateSize();
    updateDimensions();
    window.addEventListener('resize', updateSize);
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [currentImageData, updateDimensions]);

  // Render label box
  const renderLabelBox = (label: YoloLabel) => {
    const topLeft = normalizedToScreen(label.xCenter - label.width / 2, label.yCenter - label.height / 2);
    const bottomRight = normalizedToScreen(label.xCenter + label.width / 2, label.yCenter + label.height / 2);

    if (!topLeft || !bottomRight) return null;

    const boxWidth = bottomRight.x - topLeft.x;
    const boxHeight = bottomRight.y - topLeft.y;
    const color = getCategoryColor(label.classId, categories);
    const category = categories.find(c => c.id === label.classId);
    const isSelected = selectedLabelIds.includes(label.id);

    return (
      <div
        key={label.id}
        className={`absolute cursor-move transition-shadow ${isSelected ? 'ring-2 ring-white z-20 shadow-lg shadow-black/50' : 'z-10'}`}
        style={{
          left: topLeft.x,
          top: topLeft.y,
          width: boxWidth,
          height: boxHeight,
          border: `2px solid ${color}`,
          backgroundColor: isSelected ? `${color}40` : `${color}20`,
        }}
        onMouseDown={(e) => {
          if (e.button === 0) { // Left click only
            handleLabelMouseDown(e, label.id);
          }
        }}
      >
        {/* Label badge/header */}
        <div
          className="absolute -top-2 left-0 px-1 py-0.25 rounded-t text-[5px] text-white font-bold flex items-center gap-1 leading-none"
          style={{ backgroundColor: getCategoryColor(label.classId, categories) }}
        >
          <span>{typeof category?.name === 'string' ? category.name : (category?.name && typeof (category.name as any) === 'object' ? (category.name as any).name : `Class ${label.classId}`)}</span>
          {isSelected && (
            <button
              className="hover:bg-black/20 rounded p-0.5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                deleteLabel(label.id);
                toast.success('Label deleted');
              }}
              title="Delete Label"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Resize handles */}
        {isSelected && (
          <>
            {/* Corners */}
            {['nw', 'ne', 'sw', 'se'].map(h => (
              <div
                key={h}
                className={`absolute w-3 h-3 bg-white border-2 rounded-sm cursor-${h === 'nw' || h === 'se' ? 'nwse' : 'nesw'}-resize`}
                style={{
                  borderColor: color,
                  ...(h.includes('w') ? { left: -6 } : { right: -6 }),
                  ...(h.includes('n') ? { top: -6 } : { bottom: -6 }),
                }}
                onMouseDown={(e) => handleLabelMouseDown(e, label.id, h)}
              />
            ))}
            {/* Edges */}
            {['n', 's', 'e', 'w'].map(h => (
              <div
                key={h}
                className={`absolute bg-white border-2`}
                style={{
                  borderColor: color,
                  ...(h === 'n' ? { top: -4, left: '25%', width: '50%', height: 6, cursor: 'ns-resize' } : {}),
                  ...(h === 's' ? { bottom: -4, left: '25%', width: '50%', height: 6, cursor: 'ns-resize' } : {}),
                  ...(h === 'e' ? { right: -4, top: '25%', height: '50%', width: 6, cursor: 'ew-resize' } : {}),
                  ...(h === 'w' ? { left: -4, top: '25%', height: '50%', width: 6, cursor: 'ew-resize' } : {}),
                }}
                onMouseDown={(e) => handleLabelMouseDown(e, label.id, h)}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  const labelFileMap = useMemo(() => {
    const map = new Map<string, { path: string; size: number }>();
    for (const lf of labelFiles) {
      const baseName = lf.name.replace(/\.[^/.]+$/, '');
      map.set(baseName, { path: lf.path, size: lf.size ?? 0 });
    }
    return map;
  }, [labelFiles]);

  const { totalImagesCount, labeledCount, emptyFileCount, noFileCount } = useMemo(() => {
    let labeled = 0;
    let emptyFile = 0;
    let noFile = 0;

    for (const img of images) {
      const baseName = img.name.replace(/\.[^/.]+$/, '');
      const label = labelFileMap.get(baseName);
      if (!label) {
        noFile++;
      } else if (label.size === 0) {
        emptyFile++;
      } else {
        labeled++;
      }
    }

    return {
      totalImagesCount: images.length,
      labeledCount: labeled,
      emptyFileCount: emptyFile,
      noFileCount: noFile
    };
  }, [images, labelFileMap]);

  const filteredImagesList = useMemo(() => {
    return images.filter(img => {
      const matchesSearch = img.name.toLowerCase().includes(rightSearchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const baseName = img.name.replace(/\.[^/.]+$/, '');
      const label = labelFileMap.get(baseName);
      const isLabeled = label && label.size > 0;
      const isEmptyFile = label && label.size === 0;
      const hasNoFile = !label;

      if (rightFilter === 'labeled') return isLabeled;
      if (rightFilter === 'empty') return isEmptyFile;
      if (rightFilter === 'nofile' || rightFilter === 'unlabeled') return hasNoFile;
      return true;
    });
  }, [images, labelFileMap, rightFilter, rightSearchQuery]);

  if (showDashboard) {
    return (
      <YoloDashboard
        rootPath={rootPath}
        categories={categories}
        images={images}
        labelFiles={labelFiles}
        onClose={() => setShowDashboard(false)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#000000] text-white overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-[#000000] bg-[#231F20] flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-extrabold text-[#FC7603] tracking-tight">Label Studio</h1>
        </div>

        <div className="flex items-center gap-2">          {currentImageName && (
          <Badge variant="outline" className="text-gray-300">
            {currentImageName}
          </Badge>
        )}
          {isModified && (
            <Badge variant="destructive" className="text-xs">Modified</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 bg-gray-600" />

          {/* Zoom */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(0.1, zoom - 0.05))}
            disabled={zoom <= 0.1}
            title="Zoom Out (-5%)"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            <input
              type="text"
              value={zoomInput}
              onChange={(e) => setZoomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = zoomInput.replace(/[^0-9]/g, '');
                  if (val) {
                    const num = parseInt(val);
                    if (!isNaN(num)) {
                      setZoom(Math.min(5, Math.max(0.1, num / 100)));
                    }
                  }
                }
              }}
              onBlur={() => {
                const val = zoomInput.replace(/[^0-9]/g, '');
                if (val) {
                  const num = parseInt(val);
                  if (!isNaN(num)) {
                    setZoom(Math.min(5, Math.max(0.1, num / 100)));
                  }
                } else {
                  setZoomInput(`${Math.round(zoom * 100)}%`);
                }
              }}
              className="text-xs font-mono font-medium text-center w-12 bg-black/60 border border-zinc-800 rounded px-1 py-0.5 focus:outline-none focus:border-[#FC7603] text-zinc-200"
              title="Type custom zoom % and press enter"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(5, zoom + 0.05))}
            disabled={zoom >= 5}
            title="Zoom In (+5%)"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
            title="Reset Zoom/Pan"
            className="bg-[#383436] hover:bg-[#454043] border border-zinc-300/80 rounded-xl h-9 px-3 gap-1.5 text-white font-medium text-xs transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FC7603]" />
            <span>Reset</span>
          </Button>

          <Separator orientation="vertical" className="h-6 bg-gray-600" />

          {/* Navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => load_image_(currentImageIndex - 1)}
            disabled={currentImageIndex <= 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-400">
            {currentImageIndex + 1} / {images.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => load_image_(currentImageIndex + 1)}
            disabled={currentImageIndex >= images.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 bg-[#000000]" />

          {/* Auto Save Toggle */}
          <div className="flex items-center gap-2 mr-2">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Auto Save</span>
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
              className="data-[state=checked]:bg-[#004526]"
            />
          </div>

          <Separator orientation="vertical" className="h-6 bg-[#000000]" />

          {/* Save */}
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={!isModified}
            className="bg-[#004526] hover:bg-[#005c33] border border-[#005c33]/50 text-white shadow-md shadow-[#004526]/30 font-bold transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>

          {/* Delete Image */}
          <Button
            variant="default"
            size="sm"
            onClick={handleDeleteCurrentImage}
            disabled={currentImageIndex < 0 || images.length === 0}
            className="bg-[#C31230] hover:bg-[#a10e27] border border-[#C31230]/50 text-white shadow-md shadow-[#C31230]/30 font-bold transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Image
          </Button>

          {/* Upload */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpload(!showUpload)}
            className="bg-[#383436] hover:bg-[#454043] border border-zinc-300/80 rounded-xl h-9 px-3 gap-1.5 text-white font-medium text-xs transition-all shadow-sm"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#FC7603]" />
            <span>Open Files</span>
          </Button>

          {/* Dashboard Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDashboard(true)}
            className="bg-[#383436] hover:bg-[#454043] border border-zinc-300/80 rounded-xl h-9 px-3 gap-1.5 text-white font-medium text-xs transition-all shadow-sm"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#FC7603]" />
            <span>YOLO Dashboard</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Labels */}
        <aside className={`bg-[#231F20] border-r border-[#000000] flex flex-col shrink-0 transition-all duration-300 relative ${isLeftSidebarOpen ? 'w-72' : 'w-0 overflow-hidden border-none'}`}>
          <div className="p-3 border-b border-[#000000] flex flex-col gap-2">
            <div className="flex items-center justify-between gap-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Classes</h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (categories.length === 0) {
                      toast.info('No classes available to delete');
                      return;
                    }
                    setIsDeleteSelectOpen(!isDeleteSelectOpen);
                  }}
                  className={`px-2 py-1 rounded-md text-zinc-300 hover:text-white bg-[#000000]/60 hover:bg-red-950/50 border ${isDeleteSelectOpen ? 'border-red-500 text-red-400' : 'border-zinc-800'} transition-colors flex items-center gap-1 text-xs`}
                  title="Delete a class definition"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[11px]">Delete</span>
                </button>

                <button
                  onClick={handleAddCategory}
                  className="px-2 py-1 rounded-md text-zinc-300 hover:text-white bg-[#000000]/60 hover:bg-black border border-zinc-800 transition-colors flex items-center gap-1 text-xs"
                  title="Add a new class definition"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FC7603]" />
                  <span className="text-[11px]">Add</span>
                </button>

                <button
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className="px-2 py-1 rounded-md text-zinc-300 hover:text-white bg-[#000000]/60 hover:bg-black border border-zinc-800 transition-colors flex items-center gap-1 text-xs"
                  title="Collapse left sidebar"
                >
                  <ChevronLeft className="w-4 h-4 text-[#FC7603]" />
                  <span className="text-[11px]">Hide</span>
                </button>
              </div>
            </div>

            {isDeleteSelectOpen && (
              <div className="flex items-center gap-2 p-2 bg-[#000000]/80 rounded-md border border-red-900/50 text-xs">
                <span className="text-[11px] text-zinc-400 shrink-0">Class:</span>
                <select
                  className="flex-1 bg-[#231F20] text-zinc-200 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-500"
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const catToDelete = categories.find(c => c.id.toString() === val);
                    if (catToDelete) {
                      handleDeleteCategory(catToDelete);
                    }
                    setIsDeleteSelectOpen(false);
                  }}
                >
                  <option value="" disabled>-- Select class to delete --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsDeleteSelectOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs px-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="p-3 border-b border-[#000000]">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <div key={cat.id} className="relative flex items-center group">
                  <Button
                    variant={newLabelClass === cat.id ? 'default' : 'outline'}
                    size="sm"
                    className={`h-7 text-xs rounded-r-none ${newLabelClass === cat.id ? '' : 'border-gray-600'}`}
                    style={{
                      backgroundColor: newLabelClass === cat.id ? getCategoryColor(cat.id, categories) : 'transparent',
                      borderColor: getCategoryColor(cat.id, categories),
                      color: newLabelClass === cat.id ? 'white' : getCategoryColor(cat.id, categories),
                    }}
                    onClick={() => startNewLabel(cat.id)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {cat.name}
                  </Button>
                  <label
                    className="h-7 px-1.5 flex items-center justify-center rounded-r-md border border-l-0 bg-[#000000]/70 hover:bg-[#000000] cursor-pointer transition-colors"
                    title={`Click to change color for ${cat.name}`}
                    style={{ borderColor: getCategoryColor(cat.id, categories) }}
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
                      style={{ backgroundColor: getCategoryColor(cat.id, categories) }}
                    />
                    <input
                      type="color"
                      value={getCategoryColor(cat.id, categories)}
                      onChange={(e) => handleUpdateCategoryColor(cat.id, e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-[#000000] flex items-center justify-between">
              <h2 className="text-sm font-semibold">Labels ({labels.filter(l => l.id !== 'temp-new').length})</h2>
              {selectedLabelIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-red-400 hover:text-red-300"
                  onClick={() => {
                    selectedLabelIds.forEach(id => deleteLabel(id));
                    setSelectedLabelIds([]);
                    toast.success('Labels deleted');
                  }}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete ({selectedLabelIds.length})
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {labels.filter(l => l.id !== 'temp-new').map((label) => {
                  const category = categories.find(c => c.id === label.classId);
                  const color = getCategoryColor(label.classId, categories);
                  const isSelected = selectedLabelIds.includes(label.id);

                  return (
                    <div
                      key={label.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${isSelected
                        ? 'bg-[#FC7603]/10 border border-[#FC7603]/50 text-[#FC7603] font-semibold'
                        : 'bg-[#000000]/40 border border-zinc-900 hover:bg-[#000000]/60 text-zinc-350'
                        }`}
                      onClick={(e) => handleLabelSelect(label.id, e.ctrlKey || e.metaKey)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium flex-1">
                          {category?.name || `Class ${label.classId}`}
                        </span>
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 font-mono">
                        {label.xCenter.toFixed(3)}, {label.yCenter.toFixed(3)} | {label.width.toFixed(3)} x {label.height.toFixed(3)}
                      </div>
                    </div>
                  );
                })}

                {labels.filter(l => l.id !== 'temp-new').length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No labels yet</p>
                    <p className="text-xs mt-1">Click a category button above to draw</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {!isLeftSidebarOpen && (
            <button
              onClick={() => setIsLeftSidebarOpen(true)}
              className="absolute top-3 left-3 z-20 px-2.5 py-1.5 bg-[#231F20] hover:bg-[#000000] border border-zinc-800 text-zinc-300 hover:text-[#FC7603] rounded-r-lg shadow-lg flex items-center gap-1 text-xs transition-all"
              title="Expand Categories & Labels Sidebar"
            >
              <ChevronRight className="w-4 h-4 text-[#FC7603]" />
              <span className="font-semibold text-[11px]">Classes</span>
            </button>
          )}

          {!isRightSidebarOpen && (
            <button
              onClick={() => setIsRightSidebarOpen(true)}
              className="absolute top-3 right-3 z-20 px-2.5 py-1.5 bg-[#231F20] hover:bg-[#000000] border border-zinc-800 text-zinc-300 hover:text-[#FC7603] rounded-l-lg shadow-lg flex items-center gap-1 text-xs transition-all"
              title="Expand Dataset Images Sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-[#FC7603]" />
              <span className="font-semibold text-[11px]">Dataset Images</span>
            </button>
          )}
          {showUpload && (
            <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center">
              <Card className="w-full max-w-lg bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Load Local Dataset</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-400">
                    Enter the absolute path to your dataset directory. It must contain:
                  </p>
                  <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                    <li><code className="text-gray-300">notes.json</code> (Categories)</li>
                    <li><code className="text-gray-300">image/</code> (Images)</li>
                    <li><code className="text-gray-300">label/</code> (YOLO .txt files)</li>
                  </ul>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Directory Path</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="C:\Users\hp\Downloads\LABEL..."
                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={localPath}
                        onChange={(e) => setLocalPath(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLoadDirectory()}
                      />
                      <Button
                        onClick={handleLoadDirectory}
                        disabled={isLoading || !localPath}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold border-none rounded-md px-6 shadow-lg transition-all"
                      >
                        {isLoading ? 'Loading...' : 'Load'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-gray-700 bg-gray-900/60 px-3 py-3">
                    <div className="flex-1 space-y-1">
                      <div>
                        <p className="text-sm font-medium text-white">Need a starter project?</p>
                        <p className="text-xs text-gray-400">Download a ready-made sample dataset with images, labels, and notes.json.</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleDownloadSampleDataset}
                      disabled={isDownloadingSample}
                      className="border-gray-600 bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloadingSample ? 'Preparing...' : 'Download Sample'}
                    </Button>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUpload(false)}
                      disabled={images.length === 0}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Image Canvas */}
          <div
            ref={canvasRef}
            className={`flex-1 relative overflow-hidden transition-colors ${newLabelClass !== null ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-default'
              }`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
          >
            {currentImageData ? (
              <>
                <img
                  ref={imageRef}
                  src={currentImageData}
                  alt={currentImageName || 'Image'}
                  className="absolute"
                  style={{
                    left: imageMeta?.offsetX || 0,
                    top: imageMeta?.offsetY || 0,
                    width: imageMeta?.displayWidth || 'auto',
                    height: imageMeta?.displayHeight || 'auto',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                  onLoad={() => {
                    updateDimensions();
                  }}
                />

                {/* Label overlays */}
                {labels.map(renderLabelBox)}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No image loaded</p>
                  <p className="text-sm mt-2">Click "Open Files" to upload your dataset</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <footer className="px-4 py-2 bg-[#231F20] border-t border-[#000000] text-xs text-zinc-400 flex items-center gap-4 shrink-0">
            <span>Mode: {newLabelClass !== null ? 'Drawing' : 'Select'}</span>
            <Separator orientation="vertical" className="h-4 bg-[#000000]" />
            <span>
              Shortcuts: Ctrl+Z (Undo) | Ctrl+Shift+Z (Redo) | Del (Delete) | Ctrl+S (Save) | Esc (Cancel)
            </span>
          </footer>
        </main>

        {/* Right Sidebar - Dataset Files & Filters */}
        <aside className={`bg-[#231F20] border-l border-[#000000] flex flex-col shrink-0 z-10 transition-all duration-300 ${isRightSidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-none'}`}>
          <div className="p-3 border-b border-[#000000]">
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <button
                onClick={() => setIsRightSidebarOpen(false)}
                className="px-2 py-1 rounded-md text-zinc-300 hover:text-white bg-[#000000]/60 hover:bg-black border border-zinc-800 transition-colors flex items-center gap-1 text-xs"
                title="Collapse right sidebar"
              >
                <ChevronRight className="w-4 h-4 text-[#FC7603]" />
                <span className="text-[11px]">Hide Images </span>
              </button>
              <button
                onClick={handleRefreshDirectory}
                disabled={isLoading}
                className="px-2 py-1 rounded-md text-zinc-300 hover:text-white bg-[#000000]/60 hover:bg-black border border-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-1 text-xs"
                title="Refresh dataset files list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FC7603]' : 'text-[#FC7603]'}`} />
                <span className="text-[11px]">Refresh</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-4 gap-0.5 bg-[#000000]/60 p-0.5 rounded-lg border border-[#000000] mb-2 text-[9px]">
              {[
                { id: 'all', label: 'All', count: totalImagesCount },
                { id: 'labeled', label: 'Labeled', count: labeledCount },
                { id: 'empty', label: 'Empty', count: emptyFileCount },
                { id: 'unlabeled', label: 'No File', count: noFileCount }
              ].map((tab) => {
                const isActive = rightFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setRightFilter(tab.id as any)}
                    className={`py-1 px-0.5 font-semibold rounded-md transition-all flex flex-col items-center justify-center leading-tight border ${isActive
                        ? 'bg-[#FC7603]/15 border-[#FC7603]/40 text-[#FC7603]'
                        : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                      }`}
                    title={tab.id === 'empty' ? 'No labels but file exists (0 annotations)' : tab.label}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[8px] px-1 py-0.25 rounded-full font-mono mt-0.5 ${isActive ? 'bg-[#FC7603]/20 text-[#FC7603]' : 'bg-zinc-800/80 text-zinc-400'
                      }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3 h-3 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter images..."
                value={rightSearchQuery}
                onChange={(e) => setRightSearchQuery(e.target.value)}
                className="w-full bg-[#000000]/50 border border-zinc-900 rounded-md pl-7 pr-2 py-1 text-[11px] focus:outline-none focus:border-[#FC7603] text-zinc-200 placeholder-zinc-550"
              />
            </div>
          </div>

          {/* Images Scrollable Area */}
          <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-1">
            {filteredImagesList.map((img) => {
              const imgIdx = images.findIndex(im => im.path === img.path);
              const isSelected = currentImageIndex === imgIdx;
              const baseName = img.name.replace(/\.[^/.]+$/, '');

              return (
                <button
                  key={img.path}
                  onClick={() => load_image_(imgIdx)}
                  className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg text-left text-[11px] transition-colors border ${isSelected
                      ? 'bg-[#FC7603]/10 border-[#FC7603]/40 text-[#FC7603] font-bold'
                      : 'bg-transparent border-transparent hover:bg-[#000000]/30 text-zinc-300'
                    }`}
                >
                  {/* Thumbnail preview */}
                  <div className="w-8 h-8 rounded bg-[#000000] overflow-hidden shrink-0 border border-[#000000] relative">
                    <img
                      src={`/api/dashboard/image?path=${encodeURIComponent(img.path)}`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="truncate flex-1 font-mono">
                    <p className="truncate text-zinc-200">{img.name}</p>
                  </div>

                  {/* Status Dot */}
                  <div className="shrink-0 mr-1">
                    {(() => {
                      const label = labelFileMap.get(baseName);
                      if (label && label.size > 0) {
                        return <div className="w-2.5 h-2.5 rounded-full bg-[#004526]" title="Labeled (has annotations)" />;
                      } else if (label && label.size === 0) {
                        return <div className="w-2.5 h-2.5 rounded-full bg-[#FC7603]" title="No labels but file exists (0 annotations)" />;
                      } else {
                        return <div className="w-2.5 h-2.5 rounded-full bg-[#C31230]" title="No label file" />;
                      }
                    })()}
                  </div>
                </button>
              );
            })}

            {filteredImagesList.length === 0 && (
              <div className="text-center text-zinc-500 py-8 italic text-xs">
                No matching images
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
