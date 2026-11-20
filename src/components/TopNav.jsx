'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Database, ExternalLink, Activity } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Overview & Road Safety Analytics',
  '/map': 'India Accident Geospatial Map',
  '/predict': 'Predict Accident Severity (ML Inference)',
  '/dataset': 'Dataset Explorer & Data Quality',
  '/analytics': 'Model Performance & Benchmark Analytics',
  '/about': 'About Project & Academic Methodology',
};

export default function TopNav() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'RoadSense India';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-800">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>RoadSense India</span>
          <span>/</span>
          <span className="text-cyan-400 capitalize">
            {pathname === '/' ? 'Overview' : pathname.replace('/', '')}
          </span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
      </div>

      {/* Quick stats and action buttons */}
      <div className="flex items-center gap-4">
        {/* Dataset Counter Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
          <Database size={14} className="text-cyan-400" />
          <span className="text-slate-300 font-medium">500,000 Verified Records</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Academic Project Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/30 border border-blue-700/50 text-xs text-blue-300">
          <Activity size={13} className="text-blue-400" />
          <span>B.Tech ML Mini-Project</span>
        </div>

        {/* Action Link */}
        {pathname !== '/predict' && (
          <Link
            href="/predict"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-105"
          >
            <Sparkles size={14} />
            <span>Test Prediction</span>
          </Link>
        )}
      </div>
    </header>
  );
}

