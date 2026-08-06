"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CopyCheck, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Eye, 
  Sun, 
  Moon, 
  CheckCircle2,
  Info
} from 'lucide-react';

interface HealthTabProps {
  data: any;
  darkMode: boolean;
}

const InfoTooltip = ({ text }: { text: string }) => (
  <div className="relative group inline-flex items-center ml-1 z-20">
    <button
      type="button"
      className="text-zinc-500 hover:text-[#FC7603] transition-colors p-0.5 rounded-full outline-none"
      aria-label="Info explanation"
    >
      <Info className="w-3.5 h-3.5" />
    </button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-60 p-2.5 bg-zinc-950 text-zinc-200 text-[11px] font-normal leading-snug rounded-lg border border-zinc-800 shadow-2xl pointer-events-none z-50 text-left">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-950" />
    </div>
  </div>
);

export default function HealthTab({ data, darkMode }: HealthTabProps) {
  if (!data) return null;

  // Actionable Issues: ONLY Missing labels/unlinked files + Duplicates
  const missingOrUnlinkedCount = 
    (data.annotationQuality?.missingBoxes || 0) +
    (data.validation?.orphanImages?.length || 0) +
    (data.orphanedLabels?.length || 0) +
    (data.extraLabels?.length || 0);

  const duplicatesCount = 
    (data.duplicates?.images || 0) + 
    (data.duplicates?.labels || 0);

  const actionableIssuesCount = missingOrUnlinkedCount + duplicatesCount;

  // Quality Advisories (non-fatal target distribution warnings)
  const qualityAdvisoriesCount = 
    (data.annotationQuality?.tinyBoxes || 0) +
    (data.annotationQuality?.largeBoxes || 0) +
    (data.annotationQuality?.overlappingBoxes || 0) +
    (data.annotationQuality?.invalidCoords || 0) +
    (data.annotationQuality?.outOfBounds || 0);

  const getBadgeStyle = (count: number, isCritical = false) => {
    if (count === 0) {
      return "bg-[#004526]/10 border-[#004526]/30 text-[#004526] font-mono font-bold";
    }
    if (isCritical || count > 5) {
      return "bg-[#C31230]/15 border-[#C31230]/40 text-[#C31230] font-mono font-bold";
    }
    return "bg-[#FC7603]/15 border-[#FC7603]/40 text-[#FC7603] font-mono font-bold";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Hero Health Banner */}
      <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-2xl ${
        darkMode ? 'bg-[#231F20] border-[#000000]' : 'bg-white border-slate-200'
      }`}>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#FC7603]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              data.healthScore >= 90 
                ? 'bg-[#004526]/20 border border-[#004526]/40 text-[#004526]' 
                : data.healthScore >= 70 
                  ? 'bg-[#FC7603]/20 border border-[#FC7603]/40 text-[#FC7603]' 
                  : 'bg-[#C31230]/20 border border-[#C31230]/40 text-[#C31230]'
            }`}>
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">Dataset Health & Quality Diagnostic</h2>
                <Badge className={`border text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  data.healthScore >= 90 
                    ? 'bg-[#004526] text-white border-none' 
                    : data.healthScore >= 70 
                      ? 'bg-[#FC7603] text-white border-none' 
                      : 'bg-[#C31230] text-white border-none'
                }`}>
                  {data.healthScore >= 90 ? 'HEALTHY' : data.healthScore >= 70 ? 'ATTENTION REQUIRED' : 'CRITICAL ERRORS'}
                </Badge>
              </div>
              <p className="text-zinc-400 text-xs mt-1">
                Real-time scanning of missing labels, byte-level duplicate files, bounding box overlaps, and exposure anomalies.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 bg-[#000000]/60 p-4 rounded-xl border border-zinc-900 shrink-0">
            <div className="text-center">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">Health Score</span>
              <span className={`text-2xl font-black font-mono ${
                data.healthScore >= 90 ? 'text-[#004526]' : data.healthScore >= 70 ? 'text-[#FC7603]' : 'text-[#C31230]'
              }`}>
                {data.healthScore}%
              </span>
            </div>

            <div className="w-px h-8 bg-zinc-800" />

            <div className="text-center">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">Actionable Issues</span>
              <span className="text-2xl font-black font-mono text-[#C31230]">
                {actionableIssuesCount}
              </span>
            </div>

            <div className="w-px h-8 bg-zinc-800" />

            <div className="text-center">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">Duplicates</span>
              <span className="text-2xl font-black font-mono text-[#FC7603]">
                {duplicatesCount}
              </span>
            </div>

            <div className="w-px h-8 bg-zinc-800" />

            <div className="text-center">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">Advisories</span>
              <span className="text-2xl font-black font-mono text-zinc-300">
                {qualityAdvisoriesCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Diagnostic Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Bounding Box Integrity & Diagnostics */}
        <Card className={`border-none rounded-2xl shadow-lg flex flex-col justify-between ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader className="pb-3 border-b border-[#000000]">
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FC7603]" />
              Bounding Box Integrity & Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 flex-1">
            {[
              { 
                label: 'Missing Boxes', 
                val: data.annotationQuality.missingBoxes, 
                desc: 'Empty labels file links', 
                info: 'Images that have missing label files or empty annotations. Causes target localization gaps during training.',
                critical: true, 
                icon: AlertTriangle 
              },
              { 
                label: 'Tiny Boxes (<1.5%)', 
                val: data.annotationQuality.tinyBoxes, 
                desc: 'Small bounding box targets', 
                info: 'Bounding boxes smaller than 1.5% of total screen size. Small objects risk getting lost during downsampling.',
                critical: false, 
                icon: Minimize2 
              },
              { 
                label: 'Large Boxes (>80%)', 
                val: data.annotationQuality.largeBoxes, 
                desc: 'Dominating image screen space', 
                info: 'Bounding boxes occupying >80% screen space. May represent camera occlusion or background crops.',
                critical: false, 
                icon: Maximize2 
              },
              { 
                label: 'Overlapping Boxes', 
                val: data.annotationQuality.overlappingBoxes, 
                desc: 'High IoU values (> 0.85)', 
                info: 'Boxes with high Intersection-over-Union (IoU > 0.85). Redundant overlap degrades model NMS performance.',
                critical: true, 
                icon: CopyCheck 
              },
              { 
                label: 'Invalid Coordinates', 
                val: data.annotationQuality.invalidCoords, 
                desc: 'NaN or invalid string parses', 
                info: 'Corrupted labels containing NaN or unparseable coordinate strings.',
                critical: true, 
                icon: AlertTriangle 
              },
              { 
                label: 'Out-of-Bounds Coordinates', 
                val: data.annotationQuality.outOfBounds, 
                desc: 'Normalized values > 1.0', 
                info: 'Coordinates exceeding [0.0, 1.0] normalized image bounds. Causes tensor scaling errors.',
                critical: true, 
                icon: AlertTriangle 
              }
            ].map((item, index) => {
              const IconComp = item.icon;
              return (
                <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-[#000000]/40 border border-zinc-900/60 hover:border-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-black text-zinc-400">
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-xs font-semibold text-zinc-200">{item.label}</p>
                        <InfoTooltip text={item.info} />
                      </div>
                      <p className="text-[10px] text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`px-2.5 py-0.5 text-xs ${getBadgeStyle(item.val, item.critical)}`}>
                    {item.val}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 2. Duplicate Detection Engine */}
        <Card className={`border-none rounded-2xl shadow-lg flex flex-col justify-between ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader className="pb-3 border-b border-[#000000]">
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <CopyCheck className="w-4 h-4 text-[#FC7603]" />
              Duplicate Detection Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 flex-1">
            <div className="space-y-4">
              {[
                { 
                  label: 'Duplicate Images', 
                  val: data.duplicates.images, 
                  desc: 'Identical file content checksums', 
                  info: 'Identical byte-level image files in dataset. Causes model overfitting on identical training samples.',
                  icon: CopyCheck 
                },
                { 
                  label: 'Duplicate Labels', 
                  val: data.duplicates.labels, 
                  desc: 'Redundant overlaps inside identical boxes', 
                  info: 'Redundant identical bounding box coordinates within label files across dataset.',
                  icon: AlertTriangle 
                }
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#000000]/40 border border-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-black text-[#FC7603]">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <p className="text-xs font-bold text-zinc-200">{item.label}</p>
                          <InfoTooltip text={item.info} />
                        </div>
                        <p className="text-[10px] text-zinc-500">{item.desc}</p>
                      </div>
                    </div>
                    <span className="text-xl font-extrabold text-[#FC7603] font-mono">{item.val}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 3. Outlier & Exposure Analysis */}
        <Card className={`border-none rounded-2xl shadow-lg flex flex-col justify-between ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader className="pb-3 border-b border-[#000000]">
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FC7603]" />
              Outlier & Exposure Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 flex-1">
            {[
              { 
                label: 'Blurry Images', 
                val: data.outliers.blurry, 
                desc: 'Variance of Laplacian score < 100', 
                info: 'Images with Variance of Laplacian focus score < 100. Motion blur degrades edge feature extraction.',
                icon: Eye 
              },
              { 
                label: 'Dark Images', 
                val: data.outliers.dark, 
                desc: 'Average pixel values < 45', 
                info: 'Underexposed images with mean pixel luminance < 45. Reduces contrast visibility.',
                icon: Moon 
              },
              { 
                label: 'Bright Images', 
                val: data.outliers.bright, 
                desc: 'Average pixel values > 210', 
                info: 'Overexposed images with mean pixel luminance > 210. Causes highlight clipping and color loss.',
                icon: Sun 
              },
              { 
                label: 'Extremely Small Objects', 
                val: data.outliers.extremelySmall, 
                desc: 'Less than 10x10 px bounding box', 
                info: 'Bounding boxes smaller than 10x10 pixels. Difficult for object detectors to classify accurately.',
                icon: Minimize2 
              },
              { 
                label: 'Extremely Large Objects', 
                val: data.outliers.extremelyLarge, 
                desc: 'Greater than 80% screen space', 
                info: 'Bounding boxes covering almost the entire image frame.',
                icon: Maximize2 
              },
              { 
                label: 'Background Only Images', 
                val: data.outliers.empty, 
                desc: 'No objects annotated (Train bias)', 
                info: 'Images without any target object annotations, used as negative training samples.',
                icon: CheckCircle2 
              }
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#000000]/40 border border-zinc-900/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-black text-zinc-400">
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-xs font-semibold text-zinc-200">{item.label}</p>
                        <InfoTooltip text={item.info} />
                      </div>
                      <p className="text-[9px] text-zinc-550">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">{item.val}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>
    </motion.div>
  );
}
