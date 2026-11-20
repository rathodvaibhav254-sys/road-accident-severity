'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, LineChart, Line, CartesianGrid, Legend, AreaChart, Area 
} from 'recharts';
import { 
  Activity, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  Skull, 
  MapPin, 
  BrainCircuit, 
  Filter, 
  RefreshCcw,
  Info,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles
} from 'lucide-react';
import SeverityBadge from '@/components/SeverityBadge';

export default function OverviewPage() {
  const [analytics, setAnalytics] = useState(null);
  const [stateCityMap, setStateCityMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedWeather, setSelectedWeather] = useState('All');
  const [selectedRoadType, setSelectedRoadType] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        const [resAnalytics, resMap] = await Promise.all([
          fetch('/data/dashboard_analytics.json'),
          fetch('/data/state_city_mapping.json')
        ]);
        const dataAnalytics = await resAnalytics.json();
        const dataMap = await resMap.json();
        setAnalytics(dataAnalytics);
        setStateCityMap(dataMap);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const citiesForSelectedState = useMemo(() => {
    if (selectedState === 'All') return [];
    return stateCityMap[selectedState] || [];
  }, [selectedState, stateCityMap]);

  const resetFilters = () => {
    setSelectedState('All');
    setSelectedCity('All');
    setSelectedSeverity('All');
    setSelectedWeather('All');
    setSelectedRoadType('All');
  };

  if (loading || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading RoadSense analytics engine...</p>
      </div>
    );
  }

  // Prepared data for charts
  const severityChartData = [
    { name: 'Minor', count: analytics.severity_summary.Minor, color: '#10B981' },
    { name: 'Moderate', count: analytics.severity_summary.Moderate, color: '#F59E0B' },
    { name: 'Severe', count: analytics.severity_summary.Severe, color: '#F97316' },
    { name: 'Fatal', count: analytics.severity_summary.Fatal, color: '#EF4444' },
  ];

  const stateChartData = Object.entries(analytics.state_counts)
    .slice(0, 10)
    .map(([state, count]) => ({ state, count }));

  const cityChartData = Object.entries(analytics.top_cities)
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }));

  const hourlyChartData = Object.entries(analytics.hour_distribution).map(([h, count]) => ({
    hour: `${h}:00`,
    accidents: count,
  }));

  const dayChartData = Object.entries(analytics.day_distribution).map(([day, count]) => ({
    day,
    count,
  }));

  const weatherVsSeverityData = Object.entries(analytics.weather_vs_severity).map(([weather, counts]) => ({
    weather,
    Minor: counts.Minor || 0,
    Moderate: counts.Moderate || 0,
    Severe: counts.Severe || 0,
    Fatal: counts.Fatal || 0,
  }));

  const roadVsSeverityData = Object.entries(analytics.road_vs_severity).map(([road, counts]) => ({
    road: road.replace(' Road', '').replace(' Highway', ' Hwy'),
    Minor: counts.Minor || 0,
    Moderate: counts.Moderate || 0,
    Severe: counts.Severe || 0,
    Fatal: counts.Fatal || 0,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles size={13} />
            <span>AI Road Safety Intelligence Platform</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Indian Road Accident Severity Intelligence
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Supervised Machine Learning classification comparing <strong className="text-white">Decision Tree</strong>, <strong className="text-white">Random Forest</strong>, and <strong className="text-cyan-400">XGBoost</strong> across 500,000 records, 28 states, and 491 Indian cities to assess environmental, infrastructure, and temporal risk dynamics.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/predict"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <BrainCircuit size={16} />
              <span>Launch Severity Predictor</span>
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all hover:scale-105"
            >
              <MapPin size={16} className="text-cyan-400" />
              <span>Explore Interactive India Map</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Records */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Accidents</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">500,000</h3>
            <span className="text-[11px] text-slate-400">100% Verified Records</span>
          </div>
        </div>

        {/* Minor Severity */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-emerald-950/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Minor Severity</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {analytics.severity_summary.Minor.toLocaleString()}
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium">25.00% of all incidents</span>
          </div>
        </div>

        {/* Moderate Severity */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-amber-950/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">Moderate Severity</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {analytics.severity_summary.Moderate.toLocaleString()}
            </h3>
            <span className="text-[11px] text-amber-400 font-medium">25.07% of all incidents</span>
          </div>
        </div>

        {/* Severe Severity */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-orange-950/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-orange-400">Severe Severity</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {analytics.severity_summary.Severe.toLocaleString()}
            </h3>
            <span className="text-[11px] text-orange-400 font-medium">24.90% of all incidents</span>
          </div>
        </div>

        {/* Fatal Severity */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-red-950/60 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-400">Fatal Severity</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <Skull size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {analytics.severity_summary.Fatal.toLocaleString()}
            </h3>
            <span className="text-[11px] text-red-400 font-medium">25.02% of all incidents</span>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium pr-2 border-r border-slate-800">
          <Filter size={14} className="text-cyan-400" />
          <span>Dashboard Filters:</span>
        </div>

        {/* State Filter */}
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedCity('All');
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="All">All States (28)</option>
          {Object.keys(stateCityMap).sort().map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        {/* City Filter */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={selectedState === 'All'}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          <option value="All">
            {selectedState === 'All' ? 'Select a State first' : `All Cities in ${selectedState}`}
          </option>
          {citiesForSelectedState.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        {/* Severity Filter */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Severities</option>
          <option value="Minor">Minor</option>
          <option value="Moderate">Moderate</option>
          <option value="Severe">Severe</option>
          <option value="Fatal">Fatal</option>
        </select>

        {/* Weather Filter */}
        <select
          value={selectedWeather}
          onChange={(e) => setSelectedWeather(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Weather Types</option>
          <option value="Clear">Clear</option>
          <option value="Sunny">Sunny</option>
          <option value="Rainy">Rainy</option>
          <option value="Foggy">Foggy</option>
          <option value="Cloudy">Cloudy</option>
        </select>

        {/* Road Type Filter */}
        <select
          value={selectedRoadType}
          onChange={(e) => setSelectedRoadType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Road Types</option>
          <option value="National Highway">National Highway</option>
          <option value="State Highway">State Highway</option>
          <option value="Expressway">Expressway</option>
          <option value="City Road">City Road</option>
          <option value="Rural Road">Rural Road</option>
        </select>

        <button
          onClick={resetFilters}
          className="ml-auto flex items-center gap-1.5 text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RefreshCcw size={12} />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Accident Severity Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Accident Severity Distribution</h3>
                <p className="text-xs text-slate-400">Class breakdown across 500,000 labeled accident cases</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 font-medium">
                4 Balanced Classes
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#fff' }}
                    formatter={(val) => [`${val.toLocaleString()} records`, 'Volume']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {severityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
            <strong>Key Insight:</strong> Exactly ~25.0% proportion per category confirms a uniform synthetic distribution, requiring Macro F1 optimization.
          </p>
        </div>

        {/* Chart 2: Hourly Accident Dynamics */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Temporal Dynamics (24-Hour Timeline)</h3>
                <p className="text-xs text-slate-400">Accident volume by hour of occurrence (0:00 to 23:00)</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 font-medium">
                Diurnal Trend
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94A3B8" fontSize={10} tickLine={false} interval={2} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#fff' }}
                    formatter={(val) => [`${val.toLocaleString()} accidents`, 'Volume']}
                  />
                  <Area type="monotone" dataKey="accidents" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#hourGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
            <strong>Key Insight:</strong> Incidents are uniformly spread across all 24 hours (~20,800/hour), consistent with uniform temporal generation.
          </p>
        </div>

        {/* Chart 3: Top 10 Indian States by Volume */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Accidents Across Top 10 Indian States</h3>
                <p className="text-xs text-slate-400">Total reported records by state jurisdiction</p>
              </div>
              <Link href="/map" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium">
                <span>View on Map</span>
                <ArrowRight size={12} />
              </Link>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <YAxis type="category" dataKey="state" stroke="#94A3B8" fontSize={11} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#fff' }}
                    formatter={(val) => [`${val.toLocaleString()} records`, 'Accidents']}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
            <strong>Key Insight:</strong> Broad pan-Indian representation covering all 28 states, ensuring multi-region training exposure.
          </p>
        </div>

        {/* Chart 4: Weather vs Severity Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Weather vs. Severity Interaction</h3>
                <p className="text-xs text-slate-400">Proportional severity breakdown under each environmental state</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" />Minor</span>
                <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500" />Mod</span>
                <span className="flex items-center gap-1 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500" />Sev</span>
                <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" />Fatal</span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weatherVsSeverityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="weather" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="Minor" stackId="a" fill="#10B981" />
                  <Bar dataKey="Moderate" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="Severe" stackId="a" fill="#F97316" />
                  <Bar dataKey="Fatal" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
            <strong>Key Insight:</strong> 5 weather categories (Sunny, Rainy, Foggy, Cloudy, Clear) each encompass ~100k records.
          </p>
        </div>

        {/* Chart 5: Road Infrastructure vs Severity */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Road Infrastructure vs Severity</h3>
                <p className="text-xs text-slate-400">Severity strata across Expressways, Highways, and City Roads</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roadVsSeverityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="road" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="Minor" stackId="b" fill="#10B981" />
                  <Bar dataKey="Moderate" stackId="b" fill="#F59E0B" />
                  <Bar dataKey="Severe" stackId="b" fill="#F97316" />
                  <Bar dataKey="Fatal" stackId="b" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
            <strong>Key Insight:</strong> Expressways and Highways exhibit balanced accident proportions across all severity classes.
          </p>
        </div>

        {/* Chart 6: Weekly Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Weekly Accident Distribution</h3>
                <p className="text-xs text-slate-400">Total volume across Monday to Sunday</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} domain={['dataMin - 5000', 'dataMax + 5000']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#fff' }}
                    formatter={(val) => [`${val.toLocaleString()} accidents`, 'Volume']}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
            <strong>Key Insight:</strong> Weekly distribution is steady (~71,400 accidents per day), reflecting uniform temporal coverage.
          </p>
        </div>
      </div>

      {/* Factual Academic Insights Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950/40 border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-cyan-400 shrink-0">
            <Info size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">
              Data Science & Research Summary
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Exploratory Data Analysis verifies that the cleaned dataset consists of 500,000 observations with 0 missing values and 0 duplicate rows. 
              The 4 target severity classes (<strong className="text-emerald-400">Minor</strong>, <strong className="text-amber-400">Moderate</strong>, <strong className="text-orange-400">Severe</strong>, <strong className="text-red-400">Fatal</strong>) 
              have an exact 25.0% split. This uniform dispersion across temporal, geographical, and environmental attributes is characteristic of synthetic benchmark data, which is discussed in detail in the Model Analytics and Methodology reports.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
              <Link href="/analytics" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>View Model Performance Benchmarks</span>
                <ArrowRight size={13} />
              </Link>
              <Link href="/about" className="text-slate-400 hover:text-slate-300 flex items-center gap-1">
                <span>Read Full Methodology</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

