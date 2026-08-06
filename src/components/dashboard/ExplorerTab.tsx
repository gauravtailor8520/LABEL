"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ExplorerTabProps {
  data: any;
  darkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleViewImage: (img: any) => void;
}

export default function ExplorerTab({
  data,
  darkMode,
  searchQuery,
  setSearchQuery,
  handleViewImage
}: ExplorerTabProps) {
  if (!data) return null;

  const filteredImages = data.explorerPreview.filter((img: any) => 
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight">Dataset Explorer</h2>
            <Badge className="bg-[#FC7603] text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-sm shadow-[#FC7603]/30 border-none">
              {filteredImages.length} Images
            </Badge>
          </div>
          <p className="text-zinc-400 text-xs mt-1">
            Showing {filteredImages.length} of {data.stats?.totalImages || data.explorerPreview.length} total dataset images. Click any thumbnail to view bounding box target details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Filter by image name..."
            className="bg-[#231F20] border-zinc-800 text-xs h-9 w-64 rounded-lg text-zinc-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredImages.map((img: any, idx: number) => (
          <Card 
            key={idx} 
            className={`group border-none overflow-hidden rounded-xl shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
              darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
            }`}
            onClick={() => handleViewImage(img)}
          >
            <div className="relative aspect-square overflow-hidden bg-black">
              <img
                src={img.thumbnail}
                alt={img.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e: any) => {
                  e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <div className="text-[10px] text-zinc-300 w-full flex items-center justify-between font-mono">
                  <span>{img.resolution}</span>
                  <span>{img.fileSize}</span>
                </div>
              </div>
              <Badge className="absolute top-2 right-2 bg-[#FC7603] text-white font-bold border-none text-[9px] px-1.5 py-0.5">
                {img.objects} boxes
              </Badge>
            </div>
            <div className="p-3 bg-[#231F20]">
              <p className="text-xs font-semibold text-zinc-200 truncate" title={img.name}>{img.name}</p>
              <div className="flex flex-wrap gap-1 mt-1.5 overflow-hidden h-5">
                {img.classes.slice(0, 2).map((c: string, cIdx: number) => (
                  <Badge key={cIdx} variant="secondary" className="text-[8px] border-none bg-[#000000] text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                    {c}
                  </Badge>
                ))}
                {img.classes.length > 2 && (
                  <Badge variant="secondary" className="text-[8px] border-none bg-[#000000] text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                    +{img.classes.length - 2}
                  </Badge>
                )}
                {img.classes.length === 0 && (
                  <span className="text-[9px] text-zinc-500 italic">Empty</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
