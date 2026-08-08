"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface StatisticsTabProps {
  data: any;
  darkMode: boolean;
  mounted: boolean;
}

export default function StatisticsTab({
  data,
  darkMode,
  mounted
}: StatisticsTabProps) {
  const densityData = React.useMemo(() => {
    if (!data?.annotationDensity) return [];
    return data.annotationDensity.map((item: any) => {
      const rawStr = String(item.objects || '');
      const match = rawStr.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return {
          ...item,
          objects: `${num} Label${num !== 1 ? 's' : ''}`
        };
      }
      return item;
    });
  }, [data?.annotationDensity]);

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Dataset Resolution & Label Density Statistics</h2>
        <p className="text-zinc-400 text-xs mt-1">
          Examine image resolution distribution and class density variations across your dataset.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Image Resolutions Analysis */}
        <Card className={`border-none rounded-2xl shadow-lg lg:col-span-2 ${darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
          }`}>
          <CardHeader>
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Image Resolution Analysis</span>
              <span title="Frequency breakdown of image width x height pixel resolutions.">
                <Info className="w-3.5 h-3.5 text-[#FC7603] cursor-pointer hover:text-white transition-colors" />
              </span>
            </CardTitle>
            <p className="text-[10px] text-zinc-400">Breakdown of image dimensions</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.resolutionAnalysis} margin={{ top: 10, right: 20, left: 15, bottom: 25 }}>
                    <defs>
                      <linearGradient id="widthGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#FC7603" />
                        <stop offset="100%" stopColor="#C31230" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                    <XAxis
                      dataKey="resolution"
                      stroke="#71717a"
                      fontSize={9}
                      label={{ value: 'Resolution (px) →', position: 'insideBottom', offset: -15, fill: '#FC7603', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={9}
                      label={{ value: 'Images', angle: -90, position: 'insideLeft', offset: 0, fill: '#FC7603', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#231F20', borderColor: '#000000', color: '#f4f4f5' }} />
                    <Bar dataKey="count" name="Image Count" fill="url(#widthGrad)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Label Density Per Image */}
        <Card className={`border-none rounded-2xl shadow-lg ${darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
          }`}>
          <CardHeader>
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>Label Density Per Image</span>
              <span title="Frequency of label annotations per image. Shows background images (0 labels) vs dense image instances.">
                <Info className="w-3.5 h-3.5 text-[#FC7603] cursor-pointer hover:text-white transition-colors" />
              </span>
            </CardTitle>
            <p className="text-[10px] text-zinc-400">Label count distribution per image</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={densityData} margin={{ top: 10, right: 15, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                    <XAxis
                      dataKey="objects"
                      stroke="#71717a"
                      fontSize={9}
                      label={{ value: 'Labels Per Image →', position: 'insideBottom', offset: -15, fill: '#FC7603', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={9}
                      label={{ value: 'Images', angle: -90, position: 'insideLeft', offset: 0, fill: '#FC7603', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#231F20', borderColor: '#000000', color: '#f4f4f5' }} />
                    <Bar dataKey="count" name="Images Count" fill="url(#widthGrad)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </motion.div>
  );
}
