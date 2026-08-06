"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface ClassesTabProps {
  data: any;
  darkMode: boolean;
  mounted: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  chartSortType: 'name' | 'frequency';
  setChartSortType: (type: 'name' | 'frequency') => void;
  chartSortOrder: 'asc' | 'desc';
  setChartSortOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  classSortField: string;
  setClassSortField: (field: string) => void;
  classSortOrder: 'asc' | 'desc';
  setClassSortOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  CHART_COLORS: string[];
  sortedClassDistribution: any[];
  filteredClassDetails: any[];
}

export default function ClassesTab({
  data,
  darkMode,
  mounted,
  searchQuery,
  setSearchQuery,
  chartSortType,
  setChartSortType,
  chartSortOrder,
  setChartSortOrder,
  classSortField,
  setClassSortField,
  classSortOrder,
  setClassSortOrder,
  CHART_COLORS,
  sortedClassDistribution,
  filteredClassDetails
}: ClassesTabProps) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Classes & Imbalances</h2>
          <p className="text-zinc-400 text-xs mt-1">
            Review labels counts across your defined categories to discover critical distribution gaps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <Card className={`border-none rounded-2xl shadow-lg lg:col-span-2 ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider">Class Distribution (Instances count)</CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500">Sort by:</span>
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => setChartSortType('frequency')}
                className={`text-[10px] h-6 px-2.5 transition-colors ${
                  chartSortType === 'frequency'
                    ? 'bg-[#FC7603] text-white font-bold border-none'
                    : 'bg-[#000000] text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Frequency
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setChartSortType('name')}
                className={`text-[10px] h-6 px-2.5 transition-colors ${
                  chartSortType === 'name'
                    ? 'bg-[#FC7603] text-white font-bold border-none'
                    : 'bg-[#000000] text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Name
              </Button>
              <Separator orientation="vertical" className="h-4 bg-[#000000]" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setChartSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="text-[10px] h-6 px-2 text-zinc-300 border-zinc-800 bg-[#000000] hover:text-white"
              >
                {chartSortOrder.toUpperCase()}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[140px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedClassDistribution} layout="vertical" margin={{ left: 5, right: 20, top: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#FC7603" />
                        <stop offset="100%" stopColor="#C31230" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                    <XAxis type="number" stroke="#71717a" fontSize={9} />
                    <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={9} width={70} />
                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#231F20', borderColor: '#000000', color: '#f4f4f5' }} />
                    <Bar dataKey="count" fill="url(#barGrad)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card className={`border-none rounded-2xl shadow-lg ${
          darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
          <CardHeader className="pb-0">
            <CardTitle className="text-white text-xs font-bold uppercase tracking-wider">Imbalance Balance Indicator</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="h-[120px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.classDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {data.classDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#231F20', borderColor: '#000000', color: '#f4f4f5' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1 text-[9px] w-full max-h-20 overflow-y-auto px-1 font-mono">
              {data.classDistribution.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-zinc-400 truncate">{entry.name}</span>
                  <span className="text-zinc-200 font-bold ml-auto">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Class Details Table */}
      <Card className={`border-none rounded-2xl shadow-lg overflow-hidden ${
        darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
      }`}>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-3">
          <CardTitle className="text-white text-xs font-bold uppercase tracking-wider">Class Breakdown Table</CardTitle>
          <div className="relative w-72 mt-2 md:mt-0">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#FC7603]" />
            <Input
              placeholder="Filter class by name..."
              className="bg-black border border-zinc-700 hover:border-zinc-500 focus:border-[#FC7603] focus:ring-1 focus:ring-[#FC7603] h-9 text-xs pl-9 pr-3 rounded-lg text-white font-medium placeholder:text-zinc-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-zinc-800 bg-[#000000]' : 'border-slate-200 bg-slate-100'}`}>
                {[
                  { key: 'className', label: 'Class Name' },
                  { key: 'images', label: 'Images' },
                  { key: 'labels', label: 'Labels Count' },
                  { key: 'percentage', label: 'Percentage' }
                ].map((col) => (
                  <th 
                    key={col.key} 
                    className={`p-3.5 font-bold uppercase text-[11px] tracking-wider cursor-pointer transition-colors ${
                      classSortField === col.key 
                        ? 'text-[#FC7603] font-extrabold' 
                        : 'text-zinc-400 font-semibold hover:text-zinc-200'
                    }`}
                    onClick={() => {
                      if (classSortField === col.key) {
                        setClassSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setClassSortField(col.key);
                        setClassSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {classSortField === col.key && (
                        <span className="text-[#FC7603] text-[10px] font-bold">{classSortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#000000]">
              {filteredClassDetails.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-black/20 text-zinc-300">
                  <td className="p-4 font-bold text-white font-mono">{row.className}</td>
                  <td className="p-4 font-mono">{row.images.toLocaleString()}</td>
                  <td className="p-4 font-bold text-zinc-200 font-mono">{row.labels.toLocaleString()}</td>
                  <td className="p-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-right">{row.percentage}</span>
                      <div className="w-16 h-1.5 rounded-full bg-black overflow-hidden">
                        <div className="h-full bg-[#FC7603]" style={{ width: row.percentage }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </motion.div>
  );
}
