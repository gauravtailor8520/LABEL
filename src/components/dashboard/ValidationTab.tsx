"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Copy, 
  Search, 
  FileText, 
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

interface ValidationTabProps {
  data: any;
  darkMode: boolean;
  handleDeleteExtraLabel: (extra: any) => void;
  handleDeleteImageFile: (image: any) => void;
  handleDeleteOrphanedLabel: (label: any) => void;
  handlePurgeDuplicateImages?: () => void;
  handlePurgeDuplicateLabels?: () => void;
}

export default function ValidationTab({
  data,
  darkMode,
  handleDeleteExtraLabel,
  handleDeleteImageFile,
  handleDeleteOrphanedLabel,
  handlePurgeDuplicateImages,
  handlePurgeDuplicateLabels
}: ValidationTabProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!data) return null;

  const handleCopyFilename = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Copied "${text}" to clipboard!`);
  };

  // Build single unified issues list
  const allIssues = useMemo(() => {
    const list: any[] = [];

    // 1. Duplicate Image Files
    if (data.validation?.duplicateImageFiles) {
      data.validation.duplicateImageFiles.forEach((dupImg: any) => {
        list.push({
          id: `dup_img_${dupImg.name}`,
          name: dupImg.name,
          type: 'duplicate_image',
          typeLabel: 'Duplicate Image',
          badgeColor: 'bg-[#FC7603]/10 text-[#FC7603] border-[#FC7603]/30',
          detail: `Identical fingerprint to ${dupImg.originalName || 'original file'}`,
          originalName: dupImg.originalName,
          path: dupImg.path,
          size: dupImg.size,
          isImage: true,
          originalItem: dupImg,
          deleteAction: () => handleDeleteImageFile(dupImg)
        });
      });
    }

    // 2. Duplicate Label Files
    if (data.validation?.duplicateLabelFiles) {
      data.validation.duplicateLabelFiles.forEach((dupLabel: any) => {
        list.push({
          id: `dup_label_${dupLabel.name}`,
          name: dupLabel.name,
          type: 'duplicate_label',
          typeLabel: 'Duplicate Label',
          badgeColor: 'bg-[#FC7603]/10 text-[#FC7603] border-[#FC7603]/30',
          detail: `Identical annotations to ${dupLabel.originalName || 'original label'}`,
          originalName: dupLabel.originalName,
          path: dupLabel.path,
          size: dupLabel.size,
          isImage: false,
          originalItem: dupLabel,
          deleteAction: () => handleDeleteOrphanedLabel(dupLabel)
        });
      });
    }

    // 3. Unlinked Images
    if (data.validation?.orphanImages) {
      data.validation.orphanImages.forEach((img: any) => {
        list.push({
          id: `unlinked_img_${img.name}`,
          name: img.name,
          type: 'orphan_image',
          typeLabel: 'Unlinked Image',
          badgeColor: 'bg-[#C31230]/10 text-[#C31230] border-[#C31230]/30',
          detail: 'Missing matching label file (.txt)',
          path: img.path,
          size: img.size,
          isImage: true,
          originalItem: img,
          deleteAction: () => handleDeleteImageFile(img)
        });
      });
    }

    // 4. Unlinked Labels
    if (data.orphanedLabels) {
      data.orphanedLabels.forEach((label: any) => {
        list.push({
          id: `unlinked_label_${label.name}`,
          name: label.name,
          type: 'orphan_label',
          typeLabel: 'Unlinked Label',
          badgeColor: 'bg-[#C31230]/10 text-[#C31230] border-[#C31230]/30',
          detail: 'Label (.txt) missing matching image file',
          path: label.path,
          size: label.size,
          isImage: false,
          originalItem: label,
          deleteAction: () => handleDeleteOrphanedLabel(label)
        });
      });
    }

    // 5. Unregistered Class Labels
    if (data.extraLabels) {
      data.extraLabels.forEach((extra: any) => {
        list.push({
          id: `extra_${extra.imageName}_${extra.classId}`,
          name: extra.imageName,
          type: 'unregistered_class',
          typeLabel: 'Unregistered Class',
          badgeColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
          detail: `Contains unregistered class ID #${extra.classId}`,
          path: extra.imagePath || extra.labelPath || 'Labels directory',
          size: 'N/A',
          isImage: true,
          originalItem: extra,
          deleteAction: () => handleDeleteExtraLabel(extra)
        });
      });
    }

    return list;
  }, [data, handleDeleteExtraLabel, handleDeleteImageFile, handleDeleteOrphanedLabel]);

  // Counts by type
  const counts = useMemo(() => ({
    all: allIssues.length,
    duplicate_image: allIssues.filter(i => i.type === 'duplicate_image').length,
    duplicate_label: allIssues.filter(i => i.type === 'duplicate_label').length,
    orphan_image: allIssues.filter(i => i.type === 'orphan_image').length,
    orphan_label: allIssues.filter(i => i.type === 'orphan_label').length,
    unregistered_class: allIssues.filter(i => i.type === 'unregistered_class').length,
  }), [allIssues]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return allIssues.filter(item => {
      const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.originalName && item.originalName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [allIssues, activeFilter, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Dataset Validation & Integrity Report</h2>
        <p className="text-zinc-400 text-xs mt-1">
          A consolidated integrity console analyzing format structures, missing links, and duplicate file warnings.
        </p>
      </div>

      <Card className={`border-none rounded-xl shadow-md ${
        darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
      }`}>
        <CardContent className="py-2.5 px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* File System Structures */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">File System:</span>
              <div className="flex items-center gap-2">
                {[
                  { label: 'data.yaml config parsed', status: data.validation.hasYaml },
                  { label: 'classes.txt present', status: data.validation.hasClassesText },
                  { label: 'Folder structures valid', status: data.validation.trainValid && data.validation.valValid }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-[#000000]">
                    {item.status ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#004526] shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#C31230] shrink-0" />
                    )}
                    <span className="text-[11px] font-medium text-zinc-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrity Warnings Status */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Integrity Checks:</span>
              {data.validation.warnings.length === 0 ? (
                <div className="flex items-center gap-1.5 bg-[#004526]/10 px-2.5 py-1 rounded-md border border-[#004526]/20 text-[#004526]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">All file system checks passed successfully!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#C31230]/10 px-2.5 py-1 rounded-md border border-[#C31230]/20 text-[#C31230]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">{data.validation.warnings.length} Warnings Found</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SINGLE UNIFIED ISSUES CONSOLE TABLE */}
      <Card className={`border-none rounded-2xl shadow-lg overflow-hidden ${
        darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
      }`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#FC7603]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dataset Issue Records</h3>
                  <Badge className="bg-[#FC7603] text-white font-bold ml-1">
                    {allIssues.length} Total Issues
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Unified view of all detected file duplicates, unlinked files, and category mismatches.
                </p>
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {counts.duplicate_image > 0 && handlePurgeDuplicateImages && (
                  <Button
                    size="sm"
                    onClick={handlePurgeDuplicateImages}
                    className="bg-[#FC7603] hover:bg-[#FC7603]/80 text-white font-bold text-xs h-8 px-3 border-none shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Purge Duplicate Images ({counts.duplicate_image})
                  </Button>
                )}
                {counts.duplicate_label > 0 && handlePurgeDuplicateLabels && (
                  <Button
                    size="sm"
                    onClick={handlePurgeDuplicateLabels}
                    className="bg-[#C31230] hover:bg-[#C31230]/80 text-white font-bold text-xs h-8 px-3 border-none shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Purge Duplicate Labels ({counts.duplicate_label})
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Pills & Search Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `All Issues (${counts.all})` },
                  { id: 'duplicate_image', label: `Duplicate Images (${counts.duplicate_image})` },
                  { id: 'duplicate_label', label: `Duplicate Labels (${counts.duplicate_label})` },
                  { id: 'orphan_image', label: `Unlinked Images (${counts.orphan_image})` },
                  { id: 'orphan_label', label: `Unlinked Labels (${counts.orphan_label})` },
                  { id: 'unregistered_class', label: `Unregistered (${counts.unregistered_class})` }
                ].map(pill => (
                  <button
                    key={pill.id}
                    onClick={() => setActiveFilter(pill.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      activeFilter === pill.id
                        ? 'bg-[#FC7603] text-white font-extrabold shadow-sm'
                        : 'bg-black/40 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#FC7603]" />
                <input
                  type="text"
                  placeholder="Search file issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#000000] border border-[#FC7603] rounded-full h-8 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#FC7603] text-zinc-100 placeholder-zinc-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* UNIFIED ISSUES TABLE */}
            <div className="border border-zinc-900 rounded-xl overflow-hidden bg-black/40 shadow-inner">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-black/80 text-zinc-400 font-medium uppercase text-[10px] tracking-wider whitespace-nowrap">
                      <th className="p-3 font-semibold min-w-[220px]">File / Asset Name</th>
                      <th className="p-3 font-semibold min-w-[140px]">Issue Category</th>
                      <th className="p-3 font-semibold min-w-[260px]">Diagnostic Details / Reference</th>
                      <th className="p-3 font-semibold min-w-[80px]">Size</th>
                      <th className="p-3 font-semibold min-w-[180px]">Disk Location</th>
                      <th className="p-3 font-semibold text-right min-w-[110px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.length > 0 ? (
                      filteredIssues.map((item) => (
                        <tr key={item.id} className="border-b border-zinc-950 hover:bg-black/30 text-zinc-300 transition-colors">
                          {/* File Name Cell with Copy Button */}
                          <td className="p-3 font-mono font-medium text-zinc-200">
                            <div className="flex items-center gap-2">
                              {item.isImage ? (
                                <div className="w-8 h-8 rounded bg-black overflow-hidden shrink-0 border border-zinc-800">
                                  <img
                                    src={`/api/dashboard/image?path=${encodeURIComponent(item.path)}`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e: any) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center text-[#FC7603] shrink-0 border border-zinc-800">
                                  <FileText className="w-4 h-4" />
                                </div>
                              )}
                              <span className="truncate text-xs font-semibold text-white max-w-[220px]" title={item.name}>{item.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyFilename(item.name)}
                                className="h-5 w-5 text-zinc-400 hover:text-white hover:bg-zinc-800 shrink-0 ml-0.5"
                                title="Copy filename"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>

                          {/* Category Badge with No-Wrap */}
                          <td className="p-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border whitespace-nowrap inline-block ${item.badgeColor}`}>
                              {item.typeLabel}
                            </span>
                          </td>

                          {/* Detail & Original Reference with Copy */}
                          <td className="p-3 font-mono text-zinc-400">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.originalName ? (
                                <>
                                  <span className="text-zinc-400">Identical to </span>
                                  <span className="text-[#FC7603] font-bold truncate max-w-[180px]" title={item.originalName}>
                                    {item.originalName}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCopyFilename(item.originalName)}
                                    className="h-5 w-5 text-zinc-400 hover:text-white hover:bg-zinc-800 shrink-0"
                                    title="Copy original filename"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                <span className="text-zinc-300">{item.detail}</span>
                              )}
                            </div>
                          </td>

                          {/* File Size */}
                          <td className="p-3 font-mono text-zinc-400 whitespace-nowrap">
                            {item.size}
                          </td>

                          {/* Disk Location */}
                          <td className="p-3 font-mono text-[10px] text-zinc-500 max-w-[180px] truncate" title={item.path}>
                            {item.path}
                          </td>

                          {/* Action Button */}
                          <td className="p-3 text-right whitespace-nowrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={item.deleteAction}
                              className="h-7 border border-[#C31230]/20 bg-transparent text-[#C31230] hover:bg-[#C31230] hover:text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Delete File
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-zinc-500 italic">
                          {searchQuery || activeFilter !== 'all' 
                            ? 'No dataset issue files match your current search or filter criteria.' 
                            : 'No dataset file system issues detected. Your dataset integrity is clean!'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
