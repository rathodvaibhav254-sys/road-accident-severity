'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Info,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import SeverityBadge from '@/components/SeverityBadge';

export default function DatasetPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [roadFilter, setRoadFilter] = useState('All');
  const [weatherFilter, setWeatherFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    async function loadSample() {
      try {
        const res = await fetch('/data/dataset_sample.json');
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error('Failed to load dataset records:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSample();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(row => {
      if (severityFilter !== 'All' && row.accident_severity !== severityFilter) return false;
      if (roadFilter !== 'All' && row.road_type !== roadFilter) return false;
      if (weatherFilter !== 'All' && row.weather !== weatherFilter) return false;

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesCity = row.city?.toLowerCase().includes(term);
        const matchesState = row.state?.toLowerCase().includes(term);
        const matchesRoad = row.road_type?.toLowerCase().includes(term);
        const matchesWeather = row.weather?.toLowerCase().includes(term);
        if (!matchesCity && !matchesState && !matchesRoad && !matchesWeather) return false;
      }
      return true;
    });
  }, [records, severityFilter, roadFilter, weatherFilter, searchTerm]);

  // Pagination slice
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Export filtered to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = Object.keys(filteredRecords[0]).filter(k => k !== 'id');
    const csvRows = [
      headers.join(','),
      ...filteredRecords.map(row => 
        headers.map(field => `"${row[field] !== undefined ? row[field] : ''}"`).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `roadsense_filtered_accidents_${filteredRecords.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
            <Database size={14} />
            <span>Dataset Architecture & Quality Assurance</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Cleaned Indian Accident Dataset Explorer
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Preview, search, filter, and inspect verified accident feature attributes and data schemas.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow transition-all hover:scale-105 self-start md:self-auto"
        >
          <Download size={14} className="text-cyan-400" />
          <span>Export Filtered CSV ({filteredRecords.length.toLocaleString()})</span>
        </button>
      </div>

      {/* Dataset Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Observations</span>
          <p className="text-xl font-bold text-white mt-1">500,000</p>
          <span className="text-[11px] text-cyan-400">Cleaned & Preprocessed</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Feature Dimensions</span>
          <p className="text-xl font-bold text-white mt-1">14 Columns</p>
          <span className="text-[11px] text-slate-400">13 Inputs + 1 Target</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Missing Values</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">0 (0.00%)</p>
          <span className="text-[11px] text-emerald-500 flex items-center gap-1">
            <CheckCircle size={10} /> Complete Integrity
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Target Classes</span>
          <p className="text-xl font-bold text-white mt-1">4 Balanced</p>
          <span className="text-[11px] text-slate-400">Minor, Mod, Sev, Fatal</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by city, state, road, weather..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Severities</option>
            <option value="Minor">Minor</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
            <option value="Fatal">Fatal</option>
          </select>

          <select
            value={roadFilter}
            onChange={(e) => { setRoadFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Road Types</option>
            <option value="National Highway">National Highway</option>
            <option value="State Highway">State Highway</option>
            <option value="Expressway">Expressway</option>
            <option value="City Road">City Road</option>
            <option value="Rural Road">Rural Road</option>
          </select>

          <select
            value={weatherFilter}
            onChange={(e) => { setWeatherFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Weather</option>
            <option value="Clear">Clear</option>
            <option value="Sunny">Sunny</option>
            <option value="Rainy">Rainy</option>
            <option value="Foggy">Foggy</option>
            <option value="Cloudy">Cloudy</option>
          </select>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value={15}>15 / page</option>
            <option value={30}>30 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Month / Hour</th>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Road Type</th>
                <th className="py-3 px-4">Lanes</th>
                <th className="py-3 px-4">Weather</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4">Temp (°C)</th>
                <th className="py-3 px-4">Traffic Density</th>
                <th className="py-3 px-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500">
                    No matching records found. Adjust filters or search parameters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-white">{row.city}</td>
                    <td className="py-2.5 px-4 text-slate-400">{row.state}</td>
                    <td className="py-2.5 px-4 font-mono">
                      M{row.month} • {row.hour.toString().padStart(2, '0')}:00
                    </td>
                    <td className="py-2.5 px-4">{row.day_of_week}</td>
                    <td className="py-2.5 px-4">{row.road_type}</td>
                    <td className="py-2.5 px-4 font-mono">{row.lanes}L</td>
                    <td className="py-2.5 px-4">{row.weather}</td>
                    <td className="py-2.5 px-4">{row.visibility}</td>
                    <td className="py-2.5 px-4 font-mono">{row.temperature?.toFixed(1)}°</td>
                    <td className="py-2.5 px-4">{row.traffic_density}</td>
                    <td className="py-2.5 px-4">
                      <SeverityBadge severity={row.accident_severity} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{Math.min(filteredRecords.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong className="text-white">{Math.min(filteredRecords.length, currentPage * pageSize)}</strong> of{' '}
            <strong className="text-white">{filteredRecords.length.toLocaleString()}</strong> filtered rows
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2">
              Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Feature Attributes Schema Description */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-blue-400" />
          <span>Feature Engineering & Column Dictionary</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">city (str)</code>: 491 unique Indian municipal regions.
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">state (str)</code>: 28 Indian States & federal territories.
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">month (int)</code>: Calendar month (1 - 12).
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">hour (int)</code>: Time of incident in 24-hour format (0 - 23).
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">day_of_week (str)</code>: Monday through Sunday.
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">road_type (str)</code>: Highway, Expressway, Rural, City Road.
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">lanes (int)</code>: Lane count (2, 4, or 6 lanes).
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">traffic_signal (int)</code>: 0 (No signal) or 1 (Present).
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">weather (str)</code>: Sunny, Rainy, Foggy, Cloudy, Clear.
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">visibility (str)</code>: Low, Medium, High visibility.
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">temperature (float)</code>: Ambient temperature in °C.
          </div>
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
            <code className="text-cyan-400 font-bold">traffic_density (str)</code>: Low, Medium, High, Choked.
          </div>
        </div>
      </div>
    </div>
  );
}

