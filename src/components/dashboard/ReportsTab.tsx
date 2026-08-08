"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Archive, 
  Download, 
  FileSpreadsheet, 
  Code, 
  Printer
} from 'lucide-react';

interface ReportsTabProps {
  data: any;
  darkMode: boolean;
  handleGenerateReport: (format: string) => void;
}

export default function ReportsTab({
  data,
  darkMode,
  handleGenerateReport
}: ReportsTabProps) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      {/* 1. TOP CARD FULL WIDTH: REPORT GENERATOR */}
      <Card className={`border-none rounded-2xl shadow-xl w-full ${
        darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
      }`}>
        <CardHeader className="pb-3 border-b border-[#000000]">
          <CardTitle className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FC7603]" />
            Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <p className="text-zinc-300 text-xs leading-relaxed">
            Download a formal summarization report of your dataset coordinates statistics, class distribution, health evaluations, and general annotation consistency checks. All 4 export formats contain complete dataset health and class distribution statistics.
          </p>

          <div className="space-y-3">
            <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">
              Download Format (Contains Full Dataset Info)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { 
                  id: 'pdf', 
                  label: 'PDF Document (.pdf)', 
                  desc: 'Complete health score, stats, class table & print archive', 
                  icon: Printer 
                },
                { 
                  id: 'csv', 
                  label: 'CSV Data Table (.csv)', 
                  desc: 'Class distribution list, label counts, and percentages', 
                  icon: FileSpreadsheet 
                },
                { 
                  id: 'json', 
                  label: 'JSON Metadata (.json)', 
                  desc: 'Structured JSON data for automated pipelines & audits', 
                  icon: Code 
                }
              ].map((f) => {
                const IconComp = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleGenerateReport(f.id)}
                    className="flex flex-col justify-between p-4 rounded-xl border border-zinc-900 hover:border-[#FC7603] bg-black/60 hover:bg-[#FC7603]/10 transition-all text-left group shadow-sm"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-xs font-bold text-zinc-100 group-hover:text-[#FC7603]">{f.label}</span>
                      <div className="p-1.5 rounded-lg bg-black text-zinc-400 group-hover:text-[#FC7603] shrink-0 border border-zinc-800">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 leading-snug">{f.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. BOTTOM CARD FULL WIDTH: EXPORT DATASET FORMAT */}
      <Card className={`border-none rounded-2xl shadow-xl w-full relative overflow-hidden ${
        darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
      }`}>
        <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-[#FC7603]/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="pb-3 border-b border-[#000000]">
          <CardTitle className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Archive className="w-4 h-4 text-[#FC7603]" />
            Export Dataset Format
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-4 relative z-10">
          <p className="text-zinc-300 text-xs leading-relaxed">
            Directly download the normalized YOLO dataset annotations coordinates and class index mappings.
          </p>

          <div className="p-4 rounded-xl bg-black/60 border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-black text-[#FC7603] border border-zinc-800 shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">YOLO Format (.txt files)</p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Normalized center x, y, width, height bounding box coordinates and class mappings.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleGenerateReport('yolo')}
              className="bg-[#FC7603] hover:bg-[#FC7603]/80 border-none text-white font-bold text-xs h-9 px-5 rounded-lg shadow-md shadow-[#FC7603]/20 shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export YOLO Format
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
