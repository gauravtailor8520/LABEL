"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ImageIcon, 
  Tag, 
  BarChart3, 
  ShieldAlert, 
  FileCheck, 
  FileText, 
  Settings, 
  Info,
  RefreshCw, 
  Sun, 
  Moon, 
  ChevronLeft 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

import OverviewTab from './dashboard/OverviewTab';
import ExplorerTab from './dashboard/ExplorerTab';
import ExplorerPreviewModal from './dashboard/ExplorerPreviewModal';
import ClassesTab from './dashboard/ClassesTab';
import StatisticsTab from './dashboard/StatisticsTab';
import HealthTab from './dashboard/HealthTab';
import ValidationTab from './dashboard/ValidationTab';
import ReportsTab from './dashboard/ReportsTab';
import SettingsTab from './dashboard/SettingsTab';

const CHART_COLORS = ['#FC7603', '#C31230', '#004526', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

interface YoloDashboardProps {
  rootPath: string | null;
  categories: any[];
  images: any[];
  labelFiles: any[];
  onClose: () => void;
}

export default function YoloDashboard({
  rootPath,
  categories: editorCategories,
  images: editorImages,
  labelFiles: editorLabels,
  onClose
}: YoloDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Class sorting fields
  const [classSortField, setClassSortField] = useState<string>('labels');
  const [classSortOrder, setClassSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Chart sorting types
  const [chartSortType, setChartSortType] = useState<'name' | 'frequency'>('frequency');
  const [chartSortOrder, setChartSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected image for preview
  const [selectedViewerImage, setSelectedViewerImage] = useState<any>(null);
  const [viewerZoom, setViewerZoom] = useState<number>(1);

  const handleViewImage = (img: any) => {
    setSelectedViewerImage(img);
  };

  // Recharts hydration check
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [rootPath]);

  const fetchData = async () => {
    setSelectedViewerImage(null);
    setLoading(true);
    try {
      const url = rootPath 
        ? `/api/dashboard?path=${encodeURIComponent(rootPath)}`
        : `/api/dashboard`;
      
      const res = await fetch(url);
      const resJson = await res.json();
      
      if (resJson.success && resJson.data) {
        setData(resJson.data);
      } else if (resJson.stats || resJson.datasetInfo) {
        setData(resJson);
      } else {
        toast.error("Failed to load dashboard data: " + (resJson.error || "Unknown error"));
      }
    } catch (e: any) {
      toast.error("Error fetching dashboard statistics: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const sortedClassDistribution = useMemo(() => {
    if (!data?.classDistribution) return [];
    const list = [...data.classDistribution];
    
    list.sort((a, b) => {
      if (chartSortType === 'frequency') {
        return chartSortOrder === 'asc' ? a.count - b.count : b.count - a.count;
      } else {
        return chartSortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      }
    });

    return list;
  }, [data?.classDistribution, chartSortType, chartSortOrder]);

  const filteredClassDetails = useMemo(() => {
    if (!data?.classDetails) return [];
    
    let result = data.classDetails.filter((item: any) => 
      item.className.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a: any, b: any) => {
      let valA = a[classSortField];
      let valB = b[classSortField];

      if (classSortField === 'percentage') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (typeof valA === 'string') {
        return classSortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return classSortOrder === 'asc'
          ? valA - valB
          : valB - valA;
      }
    });

    return result;
  }, [data, searchQuery, classSortField, classSortOrder]);

  const handleDeleteExtraLabel = async (extraLabel: any) => {
    if (!confirm(`Are you sure you want to delete this unregistered class label (Class ID: ${extraLabel.classId}) from ${extraLabel.imageName}?`)) {
      return;
    }
    
    try {
      const url = `/api/labels?filePath=${encodeURIComponent(extraLabel.labelPath)}` +
                  `&classId=${extraLabel.classId}` +
                  `&x=${extraLabel.x}` +
                  `&y=${extraLabel.y}` +
                  `&w=${extraLabel.w}` +
                  `&h=${extraLabel.h}`;
                  
      const res = await fetch(url, { method: 'DELETE' });
      const resJson = await res.json();
      
      if (resJson.success) {
        toast.success('Extra label deleted successfully!');
        fetchData();
      } else {
        toast.error(resJson.error || 'Failed to delete extra label');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred during deletion');
    }
  };

  const handleDeleteOrphanedLabel = async (orphanedLabel: any) => {
    if (!confirm(`Are you sure you want to permanently delete the orphaned label file: ${orphanedLabel.name}?`)) {
      return;
    }

    try {
      const url = `/api/files?labelPath=${encodeURIComponent(orphanedLabel.path)}`;
      const res = await fetch(url, { method: 'DELETE' });
      const resJson = await res.json();

      if (resJson.success) {
        toast.success('Orphaned label file deleted successfully!');
        fetchData();
      } else {
        toast.error(resJson.error || 'Failed to delete orphaned label file');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred during deletion');
    }
  };

  const handleDeleteImageFile = async (image: any) => {
    if (!confirm(`Are you sure you want to permanently delete the image file: ${image.name}?`)) {
      return;
    }

    try {
      const url = `/api/files?imagePath=${encodeURIComponent(image.path)}`;
      const res = await fetch(url, { method: 'DELETE' });
      const resJson = await res.json();

      if (resJson.success) {
        toast.success('Image file deleted successfully!');
        fetchData();
      } else {
        toast.error(resJson.error || 'Failed to delete image file');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error occurred during deletion');
    }
  };

  const handlePurgeDuplicateImages = async () => {
    if (!data?.validation?.duplicateImageFiles || data.validation.duplicateImageFiles.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete all ${data.validation.duplicateImageFiles.length} duplicate image files from disk?`)) {
      return;
    }

    try {
      for (const dup of data.validation.duplicateImageFiles) {
        await fetch(`/api/files?imagePath=${encodeURIComponent(dup.path)}`, { method: 'DELETE' });
      }
      toast.success('All duplicate image files deleted successfully!');
      fetchData();
    } catch (e: any) {
      toast.error('Error during bulk deletion: ' + e.message);
    }
  };

  const handlePurgeDuplicateLabels = async () => {
    if (!data?.validation?.duplicateLabelFiles || data.validation.duplicateLabelFiles.length === 0) return;

    if (!confirm(`Are you sure you want to delete all ${data.validation.duplicateLabelFiles.length} duplicate label files from disk?`)) {
      return;
    }

    try {
      for (const dup of data.validation.duplicateLabelFiles) {
        await fetch(`/api/files?labelPath=${encodeURIComponent(dup.path)}`, { method: 'DELETE' });
      }
      toast.success('All duplicate label files deleted successfully!');
      fetchData();
    } catch (e: any) {
      toast.error('Error during bulk deletion: ' + e.message);
    }
  };

  const handleGenerateReport = (format: string) => {
    if (!data) return;
    
    const reportObj = {
      title: `${data.datasetInfo.name} YOLO Dataset Report`,
      generatedAt: new Date().toISOString(),
      datasetInfo: data.datasetInfo,
      stats: data.stats,
      healthScore: `${data.healthScore}%`,
      healthDiagnostics: {
        annotationQuality: data.annotationQuality,
        duplicates: data.duplicates,
        outliers: data.outliers,
        aiInsights: data.aiInsights
      },
      warnings: data.validation.warnings,
      classes: data.classDetails
    };

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${data.datasetInfo.name}_report.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('JSON Report downloaded');
    } else if (format === 'csv') {
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Class Name,Images,Labels,Percentage\n';
      data.classDetails.forEach((c: any) => {
        csvContent += `"${c.className}",${c.images},${c.labels},"${c.percentage}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodedUri);
      downloadAnchor.setAttribute('download', `${data.datasetInfo.name}_classes.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('CSV Report downloaded');
    } else {
      // PDF & HTML printable report generator
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to open the PDF report window');
        return;
      }

      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${data.datasetInfo.name} - YOLO Dataset Health Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; background: #ffffff; padding: 40px; margin: 0; }
            h1 { font-size: 24px; font-weight: 800; color: #000000; margin: 0 0 4px 0; }
            .subtitle { font-size: 12px; color: #71717a; margin-bottom: 24px; }
            .badge { background: #FC7603; color: white; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .hero-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; background: #f4f4f5; padding: 20px; border-radius: 12px; margin-bottom: 32px; }
            .hero-stat { text-align: center; }
            .hero-stat label { font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px; }
            .hero-stat val { font-size: 20px; font-weight: 800; color: #000000; font-family: monospace; }
            h2 { font-size: 16px; font-weight: 700; color: #000000; border-bottom: 2px solid #e4e4e7; padding-bottom: 8px; margin-top: 32px; }
            .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
            .card { border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; }
            .card-title { font-size: 12px; font-weight: 700; color: #FC7603; text-transform: uppercase; margin-bottom: 12px; }
            .item-row { display: flex; justify-content: space-between; font-size: 11px; padding: 6px 0; border-bottom: 1px solid #f4f4f5; }
            .item-row:last-child { border-bottom: none; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
            th { background: #18181b; color: #ffffff; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; }
            td { border-bottom: 1px solid #e4e4e7; padding: 8px 12px; font-family: monospace; }
            .footer { margin-top: 40px; font-size: 10px; color: #a1a1aa; text-align: center; border-top: 1px solid #e4e4e7; padding-top: 16px; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1>${data.datasetInfo.name} - YOLO Dataset Health Report</h1>
              <p className="subtitle">Generated on ${new Date().toLocaleString()} | Root Path: ${data.datasetInfo.name}</p>
            </div>
            <span class="badge">Health Score: ${data.healthScore}%</span>
          </div>

          <div class="hero-grid">
            <div class="hero-stat"><label>Total Image Files</label><val>${data.stats.totalImages.toLocaleString()}</val></div>
            <div class="hero-stat"><label>Total Label Files</label><val>${(data.stats.totalLabelFiles || 0).toLocaleString()}</val></div>
            <div class="hero-stat"><label>Total Bounding Boxes</label><val>${data.stats.totalLabels.toLocaleString()}</val></div>
            <div class="hero-stat"><label>Total Classes</label><val>${data.stats.totalClasses}</val></div>
            <div class="hero-stat"><label>Avg Labels / Image</label><val>${data.stats.avgLabels.toFixed(2)}</val></div>
          </div>

          <h2>Dataset Health Diagnostics</h2>
          <div class="grid-3">
            <div class="card">
              <div class="card-title">Bounding Box Integrity & Diagnostics</div>
              <div class="item-row"><span>Missing Boxes</span><strong>${data.annotationQuality.missingBoxes}</strong></div>
              <div class="item-row"><span>Tiny Boxes (&lt;1.5%)</span><strong>${data.annotationQuality.tinyBoxes}</strong></div>
              <div class="item-row"><span>Large Boxes (&gt;80%)</span><strong>${data.annotationQuality.largeBoxes}</strong></div>
              <div class="item-row"><span>Overlapping Boxes</span><strong>${data.annotationQuality.overlappingBoxes}</strong></div>
              <div class="item-row"><span>Invalid Coords</span><strong>${data.annotationQuality.invalidCoords}</strong></div>
              <div class="item-row"><span>Out-of-Bounds</span><strong>${data.annotationQuality.outOfBounds}</strong></div>
            </div>

            <div class="card">
              <div class="card-title">Duplicate Detection Engine</div>
              <div class="item-row"><span>Duplicate Images</span><strong>${data.duplicates.images}</strong></div>
              <div class="item-row"><span>Duplicate Labels</span><strong>${data.duplicates.labels}</strong></div>
            </div>

            <div class="card">
              <div class="card-title">Outliers & Exposure Analysis</div>
              <div class="item-row"><span>Blurry Images</span><strong>${data.outliers.blurry}</strong></div>
              <div class="item-row"><span>Dark Images</span><strong>${data.outliers.dark}</strong></div>
              <div class="item-row"><span>Bright Images</span><strong>${data.outliers.bright}</strong></div>
              <div class="item-row"><span>Extremely Small</span><strong>${data.outliers.extremelySmall}</strong></div>
              <div class="item-row"><span>Extremely Large</span><strong>${data.outliers.extremelyLarge}</strong></div>
              <div class="item-row"><span>Background Only</span><strong>${data.outliers.empty}</strong></div>
            </div>
          </div>

          <h2>Class Breakdown Distribution</h2>
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Images</th>
                <th>Labels Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${data.classDetails.map((c: any) => `
                <tr>
                  <td><strong>${c.className}</strong></td>
                  <td>${c.images.toLocaleString()}</td>
                  <td>${c.labels.toLocaleString()}</td>
                  <td>${c.percentage}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${data.validation.warnings.length > 0 ? `
            <h2>Validation System Alerts</h2>
            <ul>
              ${data.validation.warnings.map((w: string) => `<li style="font-size: 11px; color: #C31230; font-family: monospace;">${w}</li>`).join('')}
            </ul>
          ` : ''}

          <div class="footer">
            YOLO Dataset Analytics v8.2 • Comprehensive Health & Quality Certification Document
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(reportHtml);
      printWindow.document.close();
      toast.success('PDF Report window opened. Use Print to Save as PDF');
    }
  };

  const getHealthColorClass = (score: number) => {
    if (score >= 90) return 'text-[#004526]';
    if (score >= 70) return 'text-[#FC7603]';
    return 'text-[#C31230]';
  };

  const getHealthBgClass = (score: number) => {
    if (score >= 90) return 'bg-[#004526]/10 border-[#004526]/20 text-[#004526]';
    if (score >= 70) return 'bg-[#FC7603]/10 border-[#FC7603]/20 text-[#FC7603]';
    return 'bg-[#C31230]/10 border-[#C31230]/20 text-[#C31230]';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Needs Review';
    return 'Critical';
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-[#000000] text-zinc-100 dark' : 'bg-slate-50 text-slate-900'} overflow-hidden font-sans transition-colors duration-200`}>
      
      {/* Header */}
      <header className={`h-16 border-b ${darkMode ? 'border-[#000000] bg-[#231F20]' : 'border-slate-200 bg-white/95'} flex items-center justify-between px-6 shrink-0 z-20`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FC7603] flex items-center justify-center text-white shadow-md shadow-[#FC7603]/30">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                YOLO Dataset Analytics
                <span className="text-[10px] bg-[#FC7603]/20 text-[#FC7603] border border-[#FC7603]/30 px-1.5 py-0.5 rounded font-mono font-normal">
                  v8.2
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
                <span>{data?.datasetInfo?.name || 'Dataset'}</span>
                <span>•</span>
                <span>{data?.stats?.totalImages || 0} Files</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-lg w-9 h-9 text-zinc-400 hover:text-zinc-100"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className={`border-zinc-800 rounded-lg h-9 gap-1.5 ${darkMode ? 'bg-[#000000] hover:bg-zinc-900 text-zinc-350' : 'bg-slate-100 hover:bg-slate-200'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FC7603]' : ''}`} />
            <span className="text-xs">Sync Scan</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGenerateReport('pdf')}
            className={`border-zinc-800 rounded-lg h-9 gap-1.5 ${darkMode ? 'bg-[#000000] hover:bg-zinc-900 text-zinc-350' : 'bg-slate-100 hover:bg-slate-200'}`}
          >
            <FileText className="w-3.5 h-3.5 text-[#FC7603]" />
            <span className="text-xs">Quick PDF</span>
          </Button>

          <Separator orientation="vertical" className="h-6 bg-[#000000]" />

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className={`border-zinc-800 rounded-lg h-9 gap-1.5 ${darkMode ? 'bg-[#000000] hover:bg-zinc-900 text-zinc-350' : 'bg-slate-100 hover:bg-slate-200'}`}
            title="Back to Label Editor"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#FC7603]" />
            <span className="text-xs">Back to Editor</span>
          </Button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sticky Sidebar */}
        <aside className={`w-64 border-r shrink-0 flex flex-col justify-between ${
          darkMode ? 'bg-[#231F20] border-[#000000]' : 'bg-white border-slate-200'
        }`}>
          <div className="flex-1 overflow-hidden flex flex-col p-4">
            <div className="mb-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-2">Navigation</div>
            
            <div className="flex-1 overflow-y-auto">
              <nav className="space-y-1 pr-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'explorer', label: 'Dataset Explorer', icon: ImageIcon },
                  { id: 'classes', label: 'Classes & Distribution', icon: Tag },
                  { id: 'statistics', label: 'Dataset Statistics', icon: BarChart3 },
                  { id: 'health', label: 'Dataset Health', icon: ShieldAlert },
                  { id: 'validation', label: 'Validation Report', icon: FileCheck },
                  { id: 'reports', label: 'Reports & Export', icon: FileText },
                  { id: 'settings', label: 'About Platform', icon: Info },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#FC7603] text-white shadow-lg shadow-[#FC7603]/20 font-bold'
                          : darkMode
                            ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#000000]/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      {item.label}
                      {item.id === 'validation' && data?.validation?.warnings?.length > 0 && (
                        <span className="ml-auto w-4 h-4 rounded-full bg-[#C31230] text-[10px] text-white flex items-center justify-center">
                          {data.validation.warnings.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Dashboard Main Scrollable Area */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[#000000]/30">
          {loading && !data ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#FC7603]" />
              <p className="text-xs font-mono">Analyzing dataset bounds & computing YOLO metrics...</p>
            </div>
          ) : !data ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-3 p-8">
              <RefreshCw className="w-8 h-8 text-[#C31230]" />
              <p className="text-sm font-semibold text-zinc-300">Unable to load dataset statistics</p>
              <p className="text-xs text-zinc-500 font-mono">Ensure a valid directory path is loaded or click retry below</p>
              <Button onClick={fetchData} className="bg-[#FC7603] hover:bg-[#FC7603]/80 text-white font-bold text-xs h-9 px-4 mt-2 shadow-md shadow-[#FC7603]/20">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Scan
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 max-w-[1600px] mx-auto space-y-8 pb-16">
                
                {activeTab === 'dashboard' && (
                  <OverviewTab
                    data={data}
                    darkMode={darkMode}
                    onClose={onClose}
                    setActiveTab={setActiveTab}
                    handleGenerateReport={handleGenerateReport}
                    getHealthColorClass={getHealthColorClass}
                    getHealthLabel={getHealthLabel}
                    getHealthBgClass={getHealthBgClass}
                  />
                )}

                {activeTab === 'explorer' && (
                  <ExplorerTab
                    data={data}
                    darkMode={darkMode}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleViewImage={handleViewImage}
                  />
                )}

                {activeTab === 'classes' && (
                  <ClassesTab
                    data={data}
                    darkMode={darkMode}
                    mounted={mounted}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    chartSortType={chartSortType}
                    setChartSortType={setChartSortType}
                    chartSortOrder={chartSortOrder}
                    setChartSortOrder={setChartSortOrder}
                    classSortField={classSortField}
                    setClassSortField={setClassSortField}
                    classSortOrder={classSortOrder}
                    setClassSortOrder={setClassSortOrder}
                    CHART_COLORS={CHART_COLORS}
                    sortedClassDistribution={sortedClassDistribution}
                    filteredClassDetails={filteredClassDetails}
                  />
                )}

                {activeTab === 'statistics' && (
                  <StatisticsTab
                    data={data}
                    darkMode={darkMode}
                    mounted={mounted}
                  />
                )}

                {activeTab === 'health' && (
                  <HealthTab
                    data={data}
                    darkMode={darkMode}
                  />
                )}

                {activeTab === 'validation' && (
                  <ValidationTab
                    data={data}
                    darkMode={darkMode}
                    handleDeleteExtraLabel={handleDeleteExtraLabel}
                    handleDeleteImageFile={handleDeleteImageFile}
                    handleDeleteOrphanedLabel={handleDeleteOrphanedLabel}
                    handlePurgeDuplicateImages={handlePurgeDuplicateImages}
                    handlePurgeDuplicateLabels={handlePurgeDuplicateLabels}
                  />
                )}

                {activeTab === 'reports' && (
                  <ReportsTab
                    data={data}
                    darkMode={darkMode}
                    handleGenerateReport={handleGenerateReport}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsTab
                    data={data}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    rootPath={rootPath}
                  />
                )}

              </div>
            </div>
          )}
        </main>

      </div>

      {/* Interactive Image Preview Modal */}
      <ExplorerPreviewModal
        selectedViewerImage={selectedViewerImage}
        onClose={() => { setSelectedViewerImage(null); setViewerZoom(1); }}
        viewerZoom={viewerZoom}
        setViewerZoom={setViewerZoom}
      />
    </div>
  );
}
