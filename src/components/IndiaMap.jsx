'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import SeverityBadge from '@/components/SeverityBadge';
import { ShieldCheck, AlertCircle, AlertTriangle, Skull, MapPin, Eye } from 'lucide-react';

// Controller to zoom into selected state or city
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function IndiaMap({ 
  cityData = [], 
  stateData = [], 
  selectedState = 'All', 
  selectedCity = 'All',
  selectedSeverity = 'All',
  mapMode = 'city_markers', // 'city_markers' | 'state_density'
  onSelectCity,
  onSelectState
}) {
  const [mapCenter, setMapCenter] = useState([22.5, 80.0]);
  const [mapZoom, setMapZoom] = useState(5);

  // Update map viewport when state or city changes
  useEffect(() => {
    if (selectedCity !== 'All') {
      const cityObj = cityData.find(c => c.city === selectedCity);
      if (cityObj) {
        setMapCenter([cityObj.lat, cityObj.lng]);
        setMapZoom(10);
        return;
      }
    }
    if (selectedState !== 'All') {
      const stateObj = stateData.find(s => s.state === selectedState);
      if (stateObj) {
        setMapCenter([stateObj.lat, stateObj.lng]);
        setMapZoom(7);
        return;
      }
    }
    setMapCenter([22.5, 80.0]);
    setMapZoom(5);
  }, [selectedState, selectedCity, stateData, cityData]);

  // Filter cities based on selections
  const filteredCities = cityData.filter(c => {
    if (selectedState !== 'All' && c.state !== selectedState) return false;
    if (selectedCity !== 'All' && c.city !== selectedCity) return false;
    if (selectedSeverity !== 'All' && c.dominant_severity !== selectedSeverity) return false;
    return true;
  });

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Minor': return '#10B981';
      case 'Moderate': return '#F59E0B';
      case 'Severe': return '#F97316';
      case 'Fatal': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#0B0F19]">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', background: '#0B0F19' }}
        scrollWheelZoom={true}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        {/* OpenStreetMap tiles with dark CSS filter (no API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* State Density Mode: Render State-Level Circles */}
        {mapMode === 'state_density' && stateData.map((st) => {
          const radius = Math.max(16, Math.min(45, (st.total_accidents / 25000) * 35));
          return (
            <CircleMarker
              key={st.state}
              center={[st.lat, st.lng]}
              radius={radius}
              pathOptions={{
                color: '#38BDF8',
                fillColor: '#0284C7',
                fillOpacity: 0.5,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelectState && onSelectState(st.state)
              }}
            >
              <Popup>
                <div className="p-2 space-y-2 text-slate-100 min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                    <h4 className="font-bold text-white text-sm">{st.state}</h4>
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                      State Aggregate
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Accidents:</span>
                      <strong className="text-white">{st.total_accidents.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cities Documented:</span>
                      <strong className="text-white">{st.city_count}</strong>
                    </div>
                  </div>

                  {/* Severity Breakdown Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] text-slate-400 font-medium">Severity Distribution:</div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-800">
                      <div style={{ width: `${(st.severities.Minor / st.total_accidents) * 100}%` }} className="bg-emerald-500" title={`Minor: ${st.severities.Minor}`} />
                      <div style={{ width: `${(st.severities.Moderate / st.total_accidents) * 100}%` }} className="bg-amber-500" title={`Moderate: ${st.severities.Moderate}`} />
                      <div style={{ width: `${(st.severities.Severe / st.total_accidents) * 100}%` }} className="bg-orange-500" title={`Severe: ${st.severities.Severe}`} />
                      <div style={{ width: `${(st.severities.Fatal / st.total_accidents) * 100}%` }} className="bg-red-500" title={`Fatal: ${st.severities.Fatal}`} />
                    </div>
                    <div className="grid grid-cols-4 text-[10px] text-center pt-1">
                      <span className="text-emerald-400">{st.severities.Minor}</span>
                      <span className="text-amber-400">{st.severities.Moderate}</span>
                      <span className="text-orange-400">{st.severities.Severe}</span>
                      <span className="text-red-400">{st.severities.Fatal}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* City Markers Mode: Render Individual Verified City Centroids */}
        {mapMode === 'city_markers' && filteredCities.map((c) => {
          const color = getSeverityColor(c.dominant_severity);
          const radius = Math.max(6, Math.min(14, (c.total_accidents / 1300) * 11));
          
          return (
            <CircleMarker
              key={`${c.state}-${c.city}`}
              center={[c.lat, c.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.65,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => onSelectCity && onSelectCity(c.city)
              }}
            >
              <Popup>
                <div className="p-2 space-y-2.5 text-slate-100 min-w-[240px]">
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.city}</h4>
                      <p className="text-[11px] text-slate-400">{c.state}</p>
                    </div>
                    <SeverityBadge severity={c.dominant_severity} size="sm" />
                  </div>

                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total City Accidents:</span>
                      <strong className="text-white">{c.total_accidents.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Top Weather Condition:</span>
                      <span className="text-cyan-300">{c.top_weather}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Frequent Road Type:</span>
                      <span className="text-slate-300">{c.top_road_type}</span>
                    </div>
                  </div>

                  {/* Mini Severity Breakdown */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Severity Class Breakdown
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800">
                      <div style={{ width: `${(c.severities.Minor / c.total_accidents) * 100}%` }} className="bg-emerald-500" />
                      <div style={{ width: `${(c.severities.Moderate / c.total_accidents) * 100}%` }} className="bg-amber-500" />
                      <div style={{ width: `${(c.severities.Severe / c.total_accidents) * 100}%` }} className="bg-orange-500" />
                      <div style={{ width: `${(c.severities.Fatal / c.total_accidents) * 100}%` }} className="bg-red-500" />
                    </div>
                    <div className="grid grid-cols-4 text-[10px] text-center pt-0.5">
                      <span className="text-emerald-400 font-medium">Min: {c.severities.Minor}</span>
                      <span className="text-amber-400 font-medium">Mod: {c.severities.Moderate}</span>
                      <span className="text-orange-400 font-medium">Sev: {c.severities.Severe}</span>
                      <span className="text-red-400 font-medium">Fat: {c.severities.Fatal}</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-500 italic pt-1">
                    *Approximate city centroid coordinates
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Floating Legend Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl text-xs space-y-2">
        <div className="font-bold text-white text-xs border-b border-slate-800 pb-1">
          Severity Color Legend
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Minor Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-300">Moderate Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-slate-300">Severe Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-300">Fatal Severity</span>
          </div>
        </div>
      </div>
    </div>
  );
}

