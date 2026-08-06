"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Bounding Box & Density Statistics</h2>
        <p className="text-zinc-400 text-xs mt-1">
          Examine spatial heatmaps, coordinate distributions, and box size variations to catch model sizing issues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Box Width Histogram */}
        <Card className={`border-none rounded-2xl shadow-lg lg:col-span-2 ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader>
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider">Bounding Box Width Dimension Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.boundingBoxStats.widthHistogram}>
                    <defs>
                      <linearGradient id="widthGrad" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#FC7603" />
                        <stop offset="100%" stopColor="#C31230" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={10} />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#231F20', borderColor: '#000000', color: '#f4f4f5' }} />
                    <Bar dataKey="count" fill="url(#widthGrad)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spatial Heatmap */}
        <Card className={`border-none rounded-2xl shadow-lg ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader>
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider">Bounding Box Spatial Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="w-[200px] h-[200px] grid grid-cols-10 grid-rows-10 border border-[#000000] bg-black p-1 gap-[1px]">
              {data.heatmap.map((pt: any, index: number) => {
                const alpha = pt.val / 100;
                return (
                  <div
                    key={index}
                    className="w-full h-full transition-all duration-200"
                    style={{
                      backgroundColor: `rgba(252, 118, 3, ${alpha})`
                    }}
                    title={`Density: ${pt.val}%`}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-550 mt-4 text-center">
              Spatial centers of annotation coordinates showing object locations across standard image layout.
            </p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Box Sizes Metrics */}
        <Card className={`border-none rounded-2xl shadow-lg ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader>
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider">Box Sizes & Metrics</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { label: 'Average Box Width', val: `${(data.boundingBoxStats.avgWidth * 100).toFixed(1)}%` },
              { label: 'Average Box Height', val: `${(data.boundingBoxStats.avgHeight * 100).toFixed(1)}%` },
              { label: 'Largest Box Size', val: `${(data.boundingBoxStats.largestWidth * 100).toFixed(1)}% x ${(data.boundingBoxStats.largestHeight * 100).toFixed(1)}%` },
              { label: 'Smallest Box Size', val: `${(data.boundingBoxStats.smallestWidth * 100).toFixed(1)}% x ${(data.boundingBoxStats.smallestHeight * 100).toFixed(1)}%` },
              { label: 'Tiny Objects count', val: data.boundingBoxStats.tinyObjects },
              { label: 'Large Objects count', val: data.boundingBoxStats.largeObjects }
            ].map((stat, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">{stat.label}</span>
                <span className="text-white font-mono font-bold">{stat.val}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Image Resolutions */}
        <Card className={`border-none rounded-2xl shadow-lg ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader>
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider">Image Resolution Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[180px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.resolutionAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                    <XAxis dataKey="resolution" stroke="#71717a" fontSize={9} />
                    <YAxis stroke="#71717a" fontSize={9} />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#231F20', borderColor: '#000000', color: '#f4f4f5' }} />
                    <Bar dataKey="count" fill="url(#widthGrad)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Annotation Density */}
        <Card className={`border-none rounded-2xl shadow-lg ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader>
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider">Annotation Density</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[180px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.annotationDensity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                    <XAxis dataKey="objects" stroke="#71717a" fontSize={9} />
                    <YAxis stroke="#71717a" fontSize={9} />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#231F20', borderColor: '#000000', color: '#f4f4f5' }} />
                    <Bar dataKey="count" fill="url(#widthGrad)" radius={[4, 4, 0, 0]} />
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
