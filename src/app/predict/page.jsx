'use client';

import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Send, 
  RefreshCcw, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  Skull, 
  CheckCircle2, 
  Clock, 
  Thermometer, 
  CloudRain, 
  TrafficCone, 
  Sparkles,
  Info
} from 'lucide-react';
import SeverityBadge from '@/components/SeverityBadge';

export default function PredictPage() {
  const [stateCityMap, setStateCityMap] = useState({});
  const [loadingMap, setLoadingMap] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    state: 'Maharashtra',
    city: 'Mumbai',
    month: 7,
    hour: 18,
    day_of_week: 'Friday',
    road_type: 'National Highway',
    lanes: 4,
    traffic_signal: 1,
    weather: 'Rainy',
    visibility: 'Medium',
    temperature: 28.5,
    traffic_density: 'High',
    festival: 'Unknown',
  });

  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCities() {
      try {
        const res = await fetch('/data/state_city_mapping.json');
        const data = await res.json();
        setStateCityMap(data);
        if (data['Maharashtra'] && data['Maharashtra'].length > 0) {
          setFormData(prev => ({ ...prev, city: data['Maharashtra'][0] }));
        }
      } catch (err) {
        console.error('Failed to load state-city map:', err);
      } finally {
        setLoadingMap(false);
      }
    }
    loadCities();
  }, []);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const cities = stateCityMap[newState] || [];
    setFormData(prev => ({
      ...prev,
      state: newState,
      city: cities.length > 0 ? cities[0] : ''
    }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `API error with status ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'error') {
        throw new Error(data.message || 'Prediction failed');
      }

      setResult(data);
    } catch (err) {
      console.error('Prediction request error:', err);
      setError(err.message || 'Failed to generate prediction. Please try again.');
    } finally {
      setPredicting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      state: 'Maharashtra',
      city: stateCityMap['Maharashtra'] ? stateCityMap['Maharashtra'][0] : 'Mumbai',
      month: 7,
      hour: 18,
      day_of_week: 'Friday',
      road_type: 'National Highway',
      lanes: 4,
      traffic_signal: 1,
      weather: 'Rainy',
      visibility: 'Medium',
      temperature: 28.5,
      traffic_density: 'High',
      festival: 'Unknown',
    });
    setResult(null);
    setError(null);
  };

  const citiesList = stateCityMap[formData.state] || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
          <BrainCircuit size={15} />
          <span>Real-Time Machine Learning Inference Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Road Accident Severity Predictor
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Provide contextual environmental, infrastructure, temporal, and traffic attributes to evaluate severity classification using our trained <strong>XGBoost Multiclass Pipeline</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" />
              <span>Input Incident Features (13 Attributes)</span>
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Geographic Features */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                1. Geographic Location
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">State (28 States)</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleStateChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    {Object.keys(stateCityMap).sort().map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">City (Dependent Dropdown)</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    {citiesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Temporal Features */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                2. Temporal Factors
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Month (1 - 12)</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {[
                      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ].map((m, idx) => (
                      <option key={m} value={idx + 1}>{idx + 1} - {m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Hour (0 - 23 24h)</label>
                  <select
                    name="hour"
                    value={formData.hour}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Day of Week</label>
                  <select
                    name="day_of_week"
                    value={formData.day_of_week}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Road Infrastructure */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                3. Road Infrastructure
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Road Classification</label>
                  <select
                    name="road_type"
                    value={formData.road_type}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="National Highway">National Highway</option>
                    <option value="State Highway">State Highway</option>
                    <option value="Expressway">Expressway</option>
                    <option value="City Road">City Road</option>
                    <option value="Rural Road">Rural Road</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Lanes Count</label>
                  <select
                    name="lanes"
                    value={formData.lanes}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={2}>2 Lanes</option>
                    <option value={4}>4 Lanes</option>
                    <option value={6}>6 Lanes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Traffic Signal</label>
                  <select
                    name="traffic_signal"
                    value={formData.traffic_signal}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={0}>No Signal (0)</option>
                    <option value={1}>Signal Present (1)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Environmental & Traffic Dynamics */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                4. Environmental & Traffic Conditions
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Weather Condition</label>
                  <select
                    name="weather"
                    value={formData.weather}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Clear">Clear</option>
                    <option value="Sunny">Sunny</option>
                    <option value="Rainy">Rainy</option>
                    <option value="Foggy">Foggy</option>
                    <option value="Cloudy">Cloudy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Visibility Level</label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low Visibility</option>
                    <option value="Medium">Medium Visibility</option>
                    <option value="High">High Visibility</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    Temperature (°C: 5 - 45)
                  </label>
                  <input
                    type="number"
                    name="temperature"
                    step="0.1"
                    min="5"
                    max="45"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Traffic Density</label>
                  <select
                    name="traffic_density"
                    value={formData.traffic_density}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Choked">Choked / Congested</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Festival / Occasion</label>
                  <select
                    name="festival"
                    value={formData.festival}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Unknown">Regular Day (None)</option>
                    <option value="Diwali">Diwali</option>
                    <option value="Holi">Holi</option>
                    <option value="Navratri">Navratri</option>
                    <option value="Eid">Eid</option>
                    <option value="Christmas">Christmas</option>
                    <option value="Durga Puja">Durga Puja</option>
                    <option value="Ganesh Chaturthi">Ganesh Chaturthi</option>
                    <option value="Pongal">Pongal</option>
                    <option value="Baisakhi">Baisakhi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={predicting}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {predicting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing Pipeline Inference...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Predict Accident Severity</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong>Inference Error:</strong>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {result ? (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 shadow-2xl space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Model Prediction Output
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-cyan-400 font-mono">
                  HTTP 200 OK
                </span>
              </div>

              {/* Predicted Class Hero */}
              <div className="text-center py-4 space-y-3">
                <span className="text-xs text-slate-400">Classified Severity Outcome:</span>
                <div>
                  <SeverityBadge severity={result.prediction} size="lg" />
                </div>
                <div className="text-xs text-slate-300 pt-1">
                  Model Confidence: <strong className="text-white font-mono">{((result.confidence_score || 0.25) * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {/* Class Probability Distribution */}
              {result.class_probabilities && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Soft Probability Estimates:</span>
                    <span className="text-[10px] text-slate-500">Multiclass Softmax</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {Object.entries(result.class_probabilities).map(([cname, prob]) => {
                      const isWinner = cname === result.prediction;
                      const barColors = {
                        Minor: 'bg-emerald-500',
                        Moderate: 'bg-amber-500',
                        Severe: 'bg-orange-500',
                        Fatal: 'bg-red-500',
                      };
                      return (
                        <div key={cname} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className={isWinner ? 'font-bold text-white flex items-center gap-1' : 'text-slate-400'}>
                              {isWinner && <CheckCircle2 size={11} className="text-cyan-400" />}
                              {cname}
                            </span>
                            <span className="font-mono text-slate-300">{(prob * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${prob * 100}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${barColors[cname] || 'bg-blue-500'} ${isWinner ? 'opacity-100 ring-2 ring-white/20' : 'opacity-60'}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Model Info */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Classification Model:</span>
                  <span className="text-white font-medium">{result.model_name || 'XGBoost Multiclass'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pretrained Artifact:</span>
                  <span className="text-cyan-400 font-mono text-[11px]">accident_severity_model.pkl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Encoding:</span>
                  <span className="text-slate-300">Index {result.severity_index} ({result.prediction})</span>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800 pt-3">
                <strong>Academic Notice:</strong> Predictions reflect conditional classification estimates of the trained pipeline. Softmax probabilities are not calibrated real-world incident probabilities. This system is designed solely for academic and comparative research purposes.
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 border-dashed text-center flex flex-col items-center justify-center min-h-[350px] text-slate-400 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-800/60 text-slate-500">
                <BrainCircuit size={32} />
              </div>
              <h3 className="font-semibold text-slate-300 text-sm">Awaiting Feature Inputs</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Fill the feature parameters on the left and click <strong>Predict Accident Severity</strong> to generate inference via the Python machine learning backend.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

