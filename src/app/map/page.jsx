'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapPin, 
  Filter, 
  Layers, 
  AlertTriangle, 
  Info, 
  RefreshCcw, 
  Maximize2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import SeverityBadge from '@/components/SeverityBadge';

// Dynamically import Leaflet Map with SSR disabled
const IndiaMap = dynamic(() => import('@/components/IndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      <p className="text-sm text-slate-400">Loading Geospatial Cartography Engine...</p>
    </div>
  ),
});

export default function MapPage() {
  const [cityData, setCityData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [stateCityMap, setStateCityMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Map settings
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [mapMode, setMapMode] = useState('city_markers'); // 'city_markers' | 'state_density'

  useEffect(() => {
    async function fetchMapData() {
      try {
        const [resCities, resStates, resMapping] = await Promise.all([
          fetch('/data/city_aggregations.json'),
          fetch('/data/state_aggregations.json'),
          fetch('/data/state_city_mapping.json')
        ]);
        const cities = await resCities.json();
        const states = await resStates.json();
        const mapping = await resMapping.json();

        setCityData(cities);
        setStateData(states);
        setStateCityMap(mapping);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMapData();
  }, []);

  const citiesInState = useMemo(() => {
    if (selectedState === 'All') return [];
    return stateCityMap[selectedState] || [];
  }, [selectedState, stateCityMap]);

  // Selected item metrics
  const activeStateMetrics = useMemo(() => {
    if (selectedState === 'All') return null;
    return stateData.find(s => s.state === selectedState);
  }, [selectedState, stateData]);

  const activeCityMetrics = useMemo(() => {
    if (selectedCity === 'All') return null;
    return cityData.find(c => c.city === selectedCity);
  }, [selectedCity, cityData]);

  const resetFilters = () => {
    setSelectedState('All');
    setSelectedCity('All');
    setSelectedSeverity('All');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
            <MapPin size={14} />
            <span>Interactive Geospatial Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            India Accident Density & Severity Map
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Explore 491 verified city centroids and 28 state aggregations across the Indian subcontinent.
          </p>
        </div>

        {/* Map Mode Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setMapMode('city_markers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapMode === 'city_markers'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            City Markers (491)
          </button>
          <button
            onClick={() => setMapMode('state_density')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapMode === 'state_density'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            State Aggregation Circles
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium pr-2 border-r border-slate-800">
          <Filter size={14} className="text-cyan-400" />
          <span>Geographic Filters:</span>
        </div>

        {/* State Selection */}
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedCity('All');
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="All">All India (28 States)</option>
          {Object.keys(stateCityMap).sort().map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* City Selection */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={selectedState === 'All'}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          <option value="All">
            {selectedState === 'All' ? 'Select a State first to zoom' : `All Cities in ${selectedState}`}
          </option>
          {citiesInState.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Severity Filter */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Severity Levels</option>
          <option value="Minor">Minor Only</option>
          <option value="Moderate">Moderate Only</option>
          <option value="Severe">Severe Only</option>
          <option value="Fatal">Fatal Only</option>
        </select>

        <button
          onClick={resetFilters}
          className="ml-auto flex items-center gap-1.5 text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RefreshCcw size={12} />
          <span>Reset Zoom & Filters</span>
        </button>
      </div>

      {/* Main Map Component */}
      <IndiaMap
        cityData={cityData}
        stateData={stateData}
        selectedState={selectedState}
        selectedCity={selectedCity}
        selectedSeverity={selectedSeverity}
        mapMode={mapMode}
        onSelectCity={(city) => setSelectedCity(city)}
        onSelectState={(state) => setSelectedState(state)}
      />

      {/* Selected Entity Details Panel */}
      {(activeStateMetrics || activeCityMetrics) && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400">
                <MapPin size={16} />
              </span>
              <div>
                <h3 className="font-bold text-white text-base">
                  {activeCityMetrics ? `${activeCityMetrics.city}, ${activeCityMetrics.state}` : activeStateMetrics.state}
                </h3>
                <span className="text-xs text-slate-400">
                  {activeCityMetrics ? 'Verified City Centroid' : 'State Jurisdiction Aggregate'}
                </span>
              </div>
            </div>
            {activeCityMetrics && (
              <SeverityBadge severity={activeCityMetrics.dominant_severity} size="md" />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400">Total Accidents:</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {(activeCityMetrics || activeStateMetrics).total_accidents.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-emerald-400">Minor Severity:</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {(activeCityMetrics || activeStateMetrics).severities.Minor.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-orange-400">Severe Severity:</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {(activeCityMetrics || activeStateMetrics).severities.Severe.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <span className="text-red-400">Fatal Severity:</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {(activeCityMetrics || activeStateMetrics).severities.Fatal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Geographic Data Integrity Callout */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5 text-xs text-slate-400 leading-relaxed">
        <Info size={18} className="text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">Geographic Data Integrity & Provenance Notice:</strong>
          <p className="mt-1">
            The dataset records regional attributes (<code className="text-cyan-300">state</code>, <code className="text-cyan-300">city</code>) without individual raw GPS coordinates. 
            Markers correspond to verified city centroid positions across 491 municipalities and are aggregated for comparative geographical analysis. They must not be interpreted as exact street-level crash telemetry.
          </p>
        </div>
      </div>
    </div>
  );
}

