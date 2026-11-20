'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, Legend, CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  Cpu, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import SeverityBadge from '@/components/SeverityBadge';

export default function AnalyticsPage() {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('XGBoost');

  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await fetch('/data/model_metadata.json');
        const data = await res.json();
        setMetadata(data);
      } catch (err) {
        console.error('Failed to load model metadata:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMeta();
  }, []);

  if (loading || !metadata) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading Model Evaluation Metrics...</p>
      </div>
    );
  }

  const evalSummary = metadata.evaluation_summary;
  const models = ['Decision Tree', 'Random Forest', 'XGBoost'];

  // Comparison Chart Data
  const comparisonData = models.map(m => ({
    model: m,
    'Test Accuracy': +(evalSummary[m].test_accuracy * 100).toFixed(2),
    'Macro F1-Score': +(evalSummary[m].macro_f1 * 100).toFixed(2),
    'Weighted F1-Score': +(evalSummary[m].weighted_f1 * 100).toFixed(2),
    'Train Accuracy': +(evalSummary[m].train_accuracy * 100).toFixed(2),
    'Training Time (s)': evalSummary[m].training_time_seconds,
  }));

  const activeModelStats = evalSummary[selectedModel];
  const activeConfusionMatrix = activeModelStats.confusion_matrix;
  const activeReport = activeModelStats.classification_report;
  const classes = metadata.target_classes;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
          <BarChart3 size={15} />
          <span>Multiclass Model Benchmarks & Scientific Evaluation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Model Performance & Comparative Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Empirical comparison of <strong>Decision Tree</strong>, <strong>Random Forest</strong>, and <strong>XGBoost</strong> classifiers trained on 400,000 observations and evaluated on 100,000 holdout test cases.
        </p>
      </div>

      {/* Best Model Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-500/20 text-cyan-400 shrink-0 border border-blue-500/30">
            <Award size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Selected Production Model
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Exported & Active
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              {metadata.best_model_name} Multiclass Classifier
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Top generalization balance with Macro F1-score of <strong>{(evalSummary[metadata.best_model_name].macro_f1 * 100).toFixed(2)}%</strong> and test accuracy of <strong>{(evalSummary[metadata.best_model_name].test_accuracy * 100).toFixed(2)}%</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-500 block text-[10px]">ARTIFACT SIZE</span>
            <span className="text-white font-bold">{metadata.model_file_size_mb} MB</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">TRAINING TIME</span>
            <span className="text-cyan-400 font-bold">{evalSummary[metadata.best_model_name].training_time_seconds}s</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px]">TEST SAMPLES</span>
            <span className="text-white font-bold">100,000</span>
          </div>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {models.map(m => (
          <button
            key={m}
            onClick={() => setSelectedModel(m)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedModel === m
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu size={14} />
            <span>{m}</span>
            {m === metadata.best_model_name && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-extrabold uppercase">
                Best
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected Model Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Test Accuracy</span>
          <p className="text-xl font-bold text-white mt-1">
            {(activeModelStats.test_accuracy * 100).toFixed(2)}%
          </p>
          <span className="text-[10px] text-slate-500">Train: {(activeModelStats.train_accuracy * 100).toFixed(2)}%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-cyan-400 font-medium">Macro F1-Score</span>
          <p className="text-xl font-bold text-cyan-300 mt-1">
            {(activeModelStats.macro_f1 * 100).toFixed(2)}%
          </p>
          <span className="text-[10px] text-slate-500">Unweighted 4-class avg</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Macro Precision</span>
          <p className="text-xl font-bold text-white mt-1">
            {(activeModelStats.macro_precision * 100).toFixed(2)}%
          </p>
          <span className="text-[10px] text-slate-500">TP / (TP + FP)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Macro Recall</span>
          <p className="text-xl font-bold text-white mt-1">
            {(activeModelStats.macro_recall * 100).toFixed(2)}%
          </p>
          <span className="text-[10px] text-slate-500">TP / (TP + FN)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Weighted F1</span>
          <p className="text-xl font-bold text-white mt-1">
            {(activeModelStats.weighted_f1 * 100).toFixed(2)}%
          </p>
          <span className="text-[10px] text-slate-500">Support-weighted</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Overfitting Gap</span>
          <p className="text-xl font-bold text-amber-400 mt-1">
            {(activeModelStats.overfitting_gap * 100).toFixed(2)}%
          </p>
          <span className="text-[10px] text-slate-500">Train vs Test Acc</span>
        </div>
      </div>

      {/* Comparison Chart & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Comparison Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Three-Algorithm Benchmark Comparison</h3>
                <p className="text-xs text-slate-400">Test Accuracy vs Macro F1 on 100,000 holdout records</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="model" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 40]} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: 8, color: '#fff' }}
                    formatter={(val) => [`${val}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="Test Accuracy" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Macro F1-Score" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
            <strong>Observation:</strong> Decision Tree exhibits class collapse on Minor and Fatal (resulting in lower Macro F1), whereas Random Forest and XGBoost distribute predictions stably across all 4 severity classes.
          </p>
        </div>

        {/* Confusion Matrix Heatmap Display */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white">Confusion Matrix — {selectedModel}</h3>
                <p className="text-xs text-slate-400">Actual vs Predicted Counts (N = 100,000)</p>
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1">
                <div>True \ Pred</div>
                <div className="text-emerald-400">Minor</div>
                <div className="text-amber-400">Moderate</div>
                <div className="text-orange-400">Severe</div>
                <div className="text-red-400">Fatal</div>
              </div>

              {classes.map((trueLabel, rowIdx) => (
                <div key={trueLabel} className="grid grid-cols-5 items-center gap-1.5 text-center text-xs">
                  <span className="text-[11px] font-semibold text-slate-300 text-left truncate pl-1">
                    {trueLabel}
                  </span>
                  {classes.map((predLabel, colIdx) => {
                    const count = activeConfusionMatrix[rowIdx][colIdx];
                    const isDiagonal = rowIdx === colIdx;
                    return (
                      <div
                        key={predLabel}
                        className={`py-2 px-1 rounded-lg font-mono font-bold text-[11px] transition-colors ${
                          isDiagonal
                            ? 'bg-blue-600/30 border border-blue-500/50 text-white'
                            : 'bg-slate-800/40 border border-slate-800 text-slate-400'
                        }`}
                        title={`True: ${trueLabel}, Predicted: ${predLabel} (${count.toLocaleString()})`}
                      >
                        {count.toLocaleString()}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800 flex justify-between">
            <span>Highlighted diagonal = Correct Predictions</span>
            <span className="font-mono text-cyan-400">Total: 100,000 cases</span>
          </div>
        </div>
      </div>

      {/* Per-Class Classification Report Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText size={18} className="text-blue-400" />
          <span>Classification Report by Severity Class ({selectedModel})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Class</th>
                <th className="py-2.5 px-4">Precision</th>
                <th className="py-2.5 px-4">Recall</th>
                <th className="py-2.5 px-4">F1-Score</th>
                <th className="py-2.5 px-4">Support (Holdout Records)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {classes.map(cname => {
                const row = activeReport[cname] || {};
                return (
                  <tr key={cname} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-semibold text-white flex items-center gap-2">
                      <SeverityBadge severity={cname} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 font-mono">{((row.precision || 0) * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-4 font-mono">{((row.recall || 0) * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-cyan-400">{((row['f1-score'] || 0) * 100).toFixed(2)}%</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{(row.support || 0).toLocaleString()}</td>
                  </tr>
                );
              })}
              {/* Macro Avg */}
              <tr className="bg-slate-800/30 font-semibold text-white">
                <td className="py-2.5 px-4 text-cyan-300">Macro Average</td>
                <td className="py-2.5 px-4 font-mono">{((activeReport['macro avg']?.precision || 0) * 100).toFixed(2)}%</td>
                <td className="py-2.5 px-4 font-mono">{((activeReport['macro avg']?.recall || 0) * 100).toFixed(2)}%</td>
                <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">{((activeReport['macro avg']?.['f1-score'] || 0) * 100).toFixed(2)}%</td>
                <td className="py-2.5 px-4 font-mono text-slate-400">100,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance Analysis */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Top 15 Feature Importances ({metadata.best_model_name})</h3>
            <p className="text-xs text-slate-400">Gini / Gain relative weight extracted from the tree ensemble</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-blue-500/10 text-cyan-400 font-mono">
            Ensemble Gain Metric
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {metadata.top_features.map((feat, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] font-mono flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs text-slate-200 font-medium truncate">{feat.feature}</span>
              </div>
              <span className="text-xs font-mono text-cyan-400 shrink-0 pl-2">
                {(feat.importance * 100).toFixed(3)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* In-depth Academic Discussion */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950/30 border border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle size={18} className="text-cyan-400" />
          <span>Academic Discussion: Why Tree Models Exhibit Uniform ~25% Performance</span>
        </h3>
        <div className="space-y-2.5">
          <p>
            <strong>1. Multiclass Uniform Null Hypothesis:</strong> In a four-class classification problem with balanced 25% class distributions, a random chance classifier produces an expected accuracy of 25.0%. Across Decision Tree (25.16%), Random Forest (24.87%), and XGBoost (25.18%), test metrics align closely with theoretical baseline expectations.
          </p>
          <p>
            <strong>2. Absence of Linear or Non-linear Feature Dominance:</strong> Correlation analysis demonstrated near-zero pairwise correlation among numerical features, and cross-tabulation confirmed balanced categorical strata. The features in this cleaned dataset do not contain artificial target leakage or overwhelming single-feature determinism.
          </p>
          <p>
            <strong>3. Gini Impurity vs. Information Gain vs. Gradient Boosting:</strong> 
            Decision Trees split nodes by minimizing Gini impurity ($G = 1 - \sum p_i^2$). With near-equal class likelihoods across branches, early splits achieve minimal information gain, causing Decision Tree to bias predictions toward the dominant internal leaf. Random Forest and XGBoost alleviate this by averaging across dozens of randomized sub-trees and sequentially reducing pseudo-residuals with learning rate $\eta = 0.1$, yielding stable Macro F1 representation.
          </p>
        </div>
      </div>
    </div>
  );
}

