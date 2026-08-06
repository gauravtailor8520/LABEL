"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, XCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface OverviewTabProps {
  data: any;
  darkMode: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  handleGenerateReport: (format: string) => void;
  getHealthColorClass: (score: number) => string;
  getHealthLabel: (score: number) => string;
  getHealthBgClass: (score: number) => string;
}

export default function OverviewTab({
  data,
  darkMode,
  onClose,
  setActiveTab,
  handleGenerateReport,
  getHealthColorClass,
  getHealthLabel,
  getHealthBgClass
}: OverviewTabProps) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Overview & Health Status</h2>
          <p className="text-zinc-400 text-xs mt-1">
            Comprehensive overview of class frequency, box distributions, and dataset validation alerts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Clock className="w-3.5 h-3.5 text-[#FC7603]" />
          <span>Last updated {data.datasetInfo.uploadDate}</span>
        </div>
      </div>

      {/* Basic Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Image Files', value: data.stats.totalImages.toLocaleString(), desc: 'Image files ', color: '#FC7603' },
          { title: 'Total Label Files', value: (data.stats.totalLabelFiles || 0).toLocaleString(), desc: 'Lable ( .txt ) files', color: '#FC7603' },
          { title: 'Total Bounding Boxes', value: data.stats.totalLabels.toLocaleString(), desc: 'Total boxes', color: '#C31230' },
          { title: 'Total Classes', value: data.stats.totalClasses.toString(), desc: 'Unique class definitions', color: '#004526' },
          { title: 'Avg Labels / Image', value: data.stats.avgLabels.toFixed(2), desc: 'Average object density', color: '#71717a' }
        ].map((card, i) => (
          <Card key={i} className={`border-none rounded-2xl shadow-lg relative overflow-hidden ${darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
            }`}>
            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: card.color }} />
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{card.title}</span>
              <h3 className="text-2xl font-extrabold tracking-tight text-white mt-1.5">{card.value}</h3>
              <span className="text-zinc-400 text-[10px] mt-2 block">{card.desc}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Stats Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Empty Images', value: data.stats.emptyImages, desc: 'Background instances', highlight: data.stats.emptyImages > 0, highlightColor: 'text-[#FC7603]' },
          { title: 'Corrupted Images', value: data.stats.corruptedImages, desc: 'Format error instances', highlight: data.stats.corruptedImages > 0, critical: true, highlightColor: 'text-[#C31230]' },
          { title: 'Missing Labels', value: data.stats.missingLabels, desc: 'Missing label files', highlight: data.stats.missingLabels > 0, critical: true, highlightColor: 'text-[#C31230]' },
          { title: 'Average Resolution', value: data.stats.avgResolution, desc: 'Dominant shape resolution' }
        ].map((item, i) => (
          <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'bg-[#231F20]/60 border-[#000000]' : 'bg-white border border-slate-200'
            }`}>
            <div className="text-[10px] font-bold text-zinc-500 uppercase">{item.title}</div>
            <div className={`text-lg font-bold mt-1 ${item.highlight ? item.highlightColor : 'text-zinc-200'
              }`}>
              {item.value}
            </div>
            <div className="text-[9px] text-zinc-500 mt-1">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Health Score & Validation Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Health Score Card */}
        <Card className={`border-none rounded-2xl shadow-lg flex flex-col justify-between ${darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
          }`}>
          <CardHeader className="pb-0">
            <CardTitle className="text-white text-sm font-bold uppercase tracking-wider">Dataset Health Score</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#000000" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={data.healthScore >= 90 ? '#004526' : data.healthScore >= 70 ? '#FC7603' : '#C31230'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * data.healthScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white">{data.healthScore}%</span>
                <span className={`text-[10px] font-bold uppercase ${getHealthColorClass(data.healthScore)}`}>
                  {getHealthLabel(data.healthScore)}
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-lg border text-center text-xs ${getHealthBgClass(data.healthScore)} w-full`}>
              <p className="font-semibold text-zinc-300">
                Quality score calculates label match consistency, coordinate health, empty indexes, and duplication indices.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Validation Summary Card */}
        <Card className={`border-none rounded-2xl shadow-lg col-span-1 lg:col-span-2 ${darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
          }`}>
          <CardHeader>
            <CardTitle className="text-white text-sm font-bold uppercase tracking-wider">Validation Checks</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {[
                  { label: 'Dataset Structure Valid', checked: data.stats.totalImages > 0 },
                  { label: 'data.yaml config parsed', checked: data.validation.hasYaml },
                  { label: 'classes.txt present', checked: data.validation.hasClassesText },
                  { label: 'Labels Match Images perfectly', checked: data.validation.labelsMatchImages },
                  { label: 'Train Folders configured', checked: data.validation.trainValid },
                  { label: 'Validation Split verified', checked: data.validation.valValid },
                  { label: 'Test Split verified', checked: data.validation.testValid }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5 text-xs">
                    {item.checked ? (
                      <CheckCircle2 className="w-4 h-4 text-[#004526] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#C31230] shrink-0" />
                    )}
                    <span className={item.checked ? 'text-zinc-300' : 'text-zinc-650 line-through'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 bg-[#000000]/60 p-4 rounded-xl border border-[#000000] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-[#FC7603] flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Validation Alerts ({data.validation.warnings.length})
                  </div>
                  <div className="space-y-1.5">
                    {data.validation.warnings.map((warn: string, index: number) => (
                      <div key={index} className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
                        <div className="w-1.5 h-1.5 bg-[#C31230] rounded-full" />
                        {warn}
                      </div>
                    ))}
                    {data.validation.warnings.length === 0 && (
                      <div className="text-[11px] text-zinc-550 italic">No validation issues detected!</div>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('validation')}
                  className="w-full text-[10px] mt-2 border-zinc-800 bg-[#231F20] text-zinc-300 hover:bg-[#231F20]/80 text-xs h-7"
                >
                  View Detailed Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Timeline, AI insights, Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Insights Panel */}
        <Card className={`border-none rounded-2xl shadow-lg lg:col-span-2 ${darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
          }`}>
          <CardHeader>
            <CardTitle className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FC7603]" />
              AI-Powered Quality Heuristics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {data.aiInsights.slice(0, 3).map((insight: string, idx: number) => (
                  <div key={idx} className="flex gap-2 text-xs text-zinc-300 border-l-2 border-[#FC7603] pl-3 py-0.5">
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {data.aiInsights.slice(3).map((insight: string, idx: number) => (
                  <div key={idx} className="flex gap-2 text-xs text-zinc-300 border-l-2 border-[#C31230] pl-3 py-0.5">
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card className={`border-none rounded-2xl shadow-lg ${darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
          }`}>
          <CardHeader>
            <CardTitle className="text-white text-sm font-bold uppercase tracking-wider">Dataset Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative pl-6 space-y-4">
              <div className="absolute top-0 bottom-0 left-2.5 w-0.5 bg-[#000000]" />
              {data.timeline.map((step: any, index: number) => (
                <div key={index} className="relative flex items-start gap-3">
                  <div className={`absolute -left-[22px] w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center z-10 ${step.done
                    ? 'bg-[#FC7603] border-none text-white'
                    : 'bg-[#231F20] border-zinc-800 text-zinc-500'
                    }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-zinc-200">{step.label}</p>
                    <p className="text-[10px] text-zinc-550 mt-0.5">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions Panel */}
      <Card className={`border-none rounded-2xl shadow-lg ${darkMode ? 'bg-[#231F20] border border-[#000000]' : 'bg-white border border-slate-200'
        }`}>
        <CardHeader>
          <CardTitle className="text-white text-sm font-bold uppercase tracking-wider">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <Button variant="outline" size="sm" onClick={onClose} className="border-zinc-800 bg-[#000000] text-xs h-9 text-zinc-300">
              Editor mode
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('explorer')} className="border-zinc-800 bg-[#000000] text-xs h-9 text-zinc-300">
              Explorer Grid
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('validation')} className="border-zinc-800 bg-[#000000] text-xs h-9 text-zinc-300">
              Validate Files
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleGenerateReport('json')} className="border-zinc-800 bg-[#000000] text-xs h-9 text-zinc-300">
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleGenerateReport('csv')} className="border-zinc-800 bg-[#000000] text-xs h-9 text-zinc-300">
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleGenerateReport('pdf')} className="border-zinc-800 bg-[#000000] text-xs h-9 text-zinc-300">
              Export PDF
            </Button>
            <Button className="bg-[#FC7603] hover:bg-[#FC7603]/80 border-none text-white font-semibold text-xs h-9 shadow-md shadow-[#FC7603]/20">
              Download Statistics
            </Button>
          </div>
        </CardContent>
      </Card>

    </motion.div>
  );
}
