"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Github, 
  ExternalLink, 
  GitFork, 
  Star, 
  Copy, 
  Cpu, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsTabProps {
  data: any;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  rootPath: string | null;
}

export default function SettingsTab({
  data,
  darkMode,
  setDarkMode,
  rootPath
}: SettingsTabProps) {
  if (!data) return null;

  const repoUrl = "https://github.com/gauravtailor8520/LABEL";

  const handleCopyRepo = () => {
    navigator.clipboard.writeText(repoUrl);
    toast.success("Repository link copied to clipboard!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      {/* Developer Appreciation & GitHub Open Source Card */}
      <Card className={`border-none rounded-2xl shadow-lg relative overflow-hidden ${
        darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
      }`}>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#FC7603]/10 rounded-full blur-3xl pointer-events-none" />
        
        <CardContent className="p-6 space-y-6 relative z-10">
          {/* Header Banner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#C31230]/10 border border-[#C31230]/20 text-[#C31230] shrink-0">
                <Heart className="w-6 h-6 fill-[#C31230] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white tracking-tight">Built with ❤️ for Developers</h3>
                  <Badge className="bg-[#FC7603] text-white text-[10px] font-extrabold px-2.5 py-0.5">
                    OPEN SOURCE
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Crafted to empower computer vision engineers and dataset annotators.
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-[#000000]" />

          {/* Platform Overview Description Box */}
          <div className="p-4 rounded-xl bg-black/40 border border-zinc-900 space-y-1.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FC7603]" />
              What is this Platform?
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              An end-to-end computer vision dataset intelligence suite engineered to inspect, validate, clean, and analyze YOLO v8/v5 annotation datasets before model training. Automatically detects byte-level duplicate image fingerprints, unlinked files, bounding box overlaps, and extreme brightness anomalies to optimize your AI dataset health.
            </p>
          </div>

          {/* GitHub Repository Box */}
          <div className="p-5 rounded-xl bg-black/60 border border-zinc-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-black text-white border border-zinc-800 shrink-0">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <a 
                    href={repoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm font-bold text-[#FC7603] hover:underline flex items-center gap-1.5 font-mono"
                  >
                    gauravtailor8520 / LABEL
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                  <p className="text-[11px] text-zinc-500">Official GitHub Repository</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyRepo}
                  className="h-8 text-xs border border-zinc-800 text-zinc-300 hover:bg-zinc-900 px-3"
                  title="Copy link"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Repository Link
                </Button>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Please feel free to contribute, star, fork, and suggest more optimizations to make this solution even better for the AI community!
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FC7603] hover:bg-[#FC7603]/80 text-white text-xs font-bold transition-all shadow-md shadow-[#FC7603]/20"
              >
                <Star className="w-4 h-4 fill-white" />
                Star & Contribute on GitHub
              </a>
              
              <a
                href={`${repoUrl}/fork`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
              >
                <GitFork className="w-4 h-4" />
                Fork Repository
              </a>
            </div>
          </div>

          {/* DEDICATED MIT LICENSE SECTION */}
          <div className="p-4 rounded-xl bg-black/60 border border-zinc-900 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FC7603]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Open Source License
                </h4>
              </div>
              <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5">
                MIT LICENSE
              </Badge>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-mono text-[11px]">
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
            </p>
            <div className="text-[10px] text-zinc-500 font-mono pt-1">
              Copyright &copy; {new Date().getFullYear()} LABEL Studio. Free for commercial and private use.
            </div>
          </div>

          <Separator className="bg-[#000000]" />

          {/* DEDICATED TECH STACK SECTION */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#FC7603]" />
              Technology Stack
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: 'Next.js 16', role: 'Fullstack Framework', tag: 'Turbopack' },
                { name: 'React 19', role: 'UI Component Core', tag: 'Client & Server' },
                { name: 'TypeScript', role: 'Type Safety & Contracts', tag: 'Strict Mode' },
                { name: 'Tailwind CSS', role: 'Design System & Styling', tag: 'Custom Theme' },
                { name: 'Framer Motion', role: 'UI Animations & Motion', tag: 'Smooth Transitions' },
                { name: 'Lucide Icons', role: 'Vector Icon System', tag: 'Modern UI' },
                { name: 'Shadcn UI', role: 'Accessible Components', tag: 'Radix Primitives' },
                { name: 'Sonner', role: 'Toast Notifications', tag: 'Interactive Feedback' },
                { name: 'Node.js FS', role: 'Disk File Scanner', tag: 'Async I/O' },
                { name: 'YOLO Parser', role: 'Annotation Hashing Engine', tag: 'Coordinate Normalizer' },
                { name: 'HTML Print PDF', role: 'Report Export Engine', tag: 'Audit Generator' },
                { name: 'JSON Schema', role: 'Metrics Export API', tag: 'Data Serialization' }
              ].map((stack, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-black/60 border border-zinc-900 space-y-1">
                  <span className="text-[9px] font-mono text-[#FC7603] font-bold block">{stack.tag}</span>
                  <p className="text-xs font-bold text-white">{stack.name}</p>
                  <p className="text-[10px] text-zinc-500">{stack.role}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
