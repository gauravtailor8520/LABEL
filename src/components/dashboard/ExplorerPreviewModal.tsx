"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExplorerPreviewModalProps {
  selectedViewerImage: any;
  onClose: () => void;
  viewerZoom: number;
  setViewerZoom: React.Dispatch<React.SetStateAction<number>>;
}

export default function ExplorerPreviewModal({
  selectedViewerImage,
  onClose,
  viewerZoom,
  setViewerZoom
}: ExplorerPreviewModalProps) {
  if (!selectedViewerImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#231F20] border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#000000] flex items-center justify-between bg-[#000000]/40">
          <div>
            <h3 className="text-sm font-bold text-white font-mono">{selectedViewerImage.name}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
              Resolution: {selectedViewerImage.resolution} | Size: {selectedViewerImage.fileSize} | Bounding Box Targets: {selectedViewerImage.objects}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-[#000000]/60 p-1 rounded-lg border border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-zinc-300 hover:text-white hover:bg-zinc-800 font-bold text-xs"
                onClick={() => setViewerZoom(prev => Math.max(0.1, parseFloat((prev - 0.05).toFixed(2))))}
                disabled={viewerZoom <= 0.1}
                title="Zoom Out (-5%)"
              >
                -
              </Button>

              <input
                type="text"
                value={`${Math.round(viewerZoom * 100)}%`}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val) {
                    const num = parseInt(val);
                    if (!isNaN(num)) {
                      setViewerZoom(Math.min(5, Math.max(0.1, num / 100)));
                    }
                  }
                }}
                className="text-xs font-mono font-medium text-center w-14 bg-black border border-zinc-800 rounded px-1.5 py-0.5 focus:outline-none focus:border-[#FC7603] text-zinc-200"
                title="Type custom zoom % and press enter"
              />

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-zinc-300 hover:text-white hover:bg-zinc-800 font-bold text-xs"
                onClick={() => setViewerZoom(prev => Math.min(5, parseFloat((prev + 0.05).toFixed(2))))}
                disabled={viewerZoom >= 5}
                title="Zoom In (+5%)"
              >
                +
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewerZoom(1)}
                className="text-xs text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 px-2 h-7 font-semibold rounded-md border border-zinc-700"
                title="Reset Zoom to 100%"
              >
                Reset
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 px-3 text-xs bg-[#C31230] text-white hover:bg-[#C31230]/80 font-bold rounded-lg"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Modal Body with Bounding Boxes Overlay & Scale Zoom */}
        <div className="flex-1 bg-black overflow-auto flex items-center justify-center p-8 relative min-h-[380px]">
          <div 
            style={{ transform: `scale(${viewerZoom})`, transformOrigin: 'center center' }}
            className="relative max-w-full transition-transform duration-100 ease-out my-auto"
          >
            <img
              src={selectedViewerImage.thumbnail}
              alt={selectedViewerImage.name}
              className="max-h-[440px] max-w-full object-contain rounded border border-[#000000]"
              onError={(e: any) => { e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }}
            />

            {selectedViewerImage.boxes && selectedViewerImage.boxes.map((box: any, bIdx: number) => {
              const left = (box.x - box.w / 2) * 100;
              const top = (box.y - box.h / 2) * 100;
              const width = box.w * 100;
              const height = box.h * 100;
              return (
                <div 
                  key={bIdx}
                  className="absolute border-2 border-[#FC7603] rounded bg-[#FC7603]/10 pointer-events-none"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`
                  }}
                >
                  <span className="absolute -top-5 left-0 bg-[#FC7603] text-white text-[9px] font-bold px-1.5 py-0.5 rounded leading-none shadow">
                    {box.className}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#000000] bg-[#000000]/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedViewerImage.classes && selectedViewerImage.classes.map((c: string, idx: number) => (
              <Badge key={idx} className="bg-[#FC7603]/20 border border-[#FC7603]/40 text-[#FC7603] text-[10px] font-bold px-2 py-0.5">
                {c}
              </Badge>
            ))}
            {(!selectedViewerImage.classes || selectedViewerImage.classes.length === 0) && (
              <span className="text-xs text-zinc-500 italic">No class labels</span>
            )}
          </div>
          <Button
            onClick={onClose}
            className="bg-[#231F20] hover:bg-[#000000] border border-zinc-700 text-zinc-300 text-xs px-4 py-1.5 rounded-lg"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
