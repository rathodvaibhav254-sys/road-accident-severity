'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Award, 
  ShieldAlert, 
  Layers, 
  Sparkles,
  GitBranch,
  ExternalLink
} from 'lucide-react';

const VIVA_QUESTIONS = [
  {
    q: "Why is Road Accident Severity modeled as a multiclass classification problem rather than regression?",
    a: "Accident severity is recorded categorically into four distinct discrete strata: Minor, Moderate, Severe, and Fatal. Treating severity as an arbitrary continuous number (e.g., 1.0 to 4.0) assumes equal cardinal distances between consecutive severity levels (e.g., that the step from Moderate to Severe is mathematically identical to the step from Severe to Fatal). Multiclass classification with soft probability estimation preserves class boundaries and optimizes class-specific decision thresholds without distorting ordinal semantics."
  },
  {
    q: "Why was Macro F1-score chosen as the primary evaluation metric alongside Accuracy?",
    a: "In multiclass evaluation, accuracy alone can be deceptive if a model favors a majority class or collapses minority classes. The Macro F1-score calculates the unweighted arithmetic mean of F1-scores across all individual classes (Minor, Moderate, Severe, Fatal): Macro F1 = (F1_minor + F1_mod + F1_sev + F1_fatal) / 4. This penalizes models that fail to predict specific severity levels (such as Decision Tree collapsing on Minor/Fatal)."
  },
  {
    q: "What is the difference between Gini Impurity and Entropy in Decision Trees?",
    a: "Both measure node impurity. Gini Impurity is formulated as Gini = 1 - sum(p_i^2), measuring the probability that a randomly chosen element is incorrectly labeled if labeled according to the class distribution. Entropy is formulated as Entropy = - sum(p_i * log2(p_i)), derived from information theory measuring information disorder. Scikit-learn defaults to Gini because it avoids costly logarithmic computation while yielding virtually identical tree topologies."
  },
  {
    q: "How does Random Forest reduce the variance of a single Decision Tree?",
    a: "Random Forest is an ensemble learning method based on Bootstrap Aggregation (Bagging). It draws N bootstrap samples (random sampling with replacement) from the training set and trains an independent decision tree on each sample. At each node split, it restricts the candidate features to a random subset (typically sqrt(p)). By averaging the predictions across all trees, individual tree variance is cancelled out while retaining low bias."
  },
  {
    q: "How does XGBoost differ conceptually from Random Forest?",
    a: "While Random Forest trains multiple deep trees independently in parallel (bagging), XGBoost builds shallow trees sequentially (boosting). Each new tree is trained to predict the negative gradient (pseudo-residuals) of the loss function with respect to the current ensemble's predictions. XGBoost incorporates second-order Taylor expansion (gradient and hessian) and L1/L2 regularization terms directly into the objective function to prevent overfitting."
  },
  {
    q: "Why did we use a Scikit-learn Pipeline with ColumnTransformer?",
    a: "Using Pipeline and ColumnTransformer prevents data leakage. Preprocessing operations like OneHotEncoder and SimpleImputer are fitted strictly on the 80% training split during cross-validation or split-fitting, and only applied (transformed) on the 20% test split. Preprocessing the whole dataset prior to splitting leaks distribution information from test into train."
  },
  {
    q: "Why do the models achieve approximately ~25% accuracy on this dataset?",
    a: "The dataset has four uniformly balanced classes (25% each). Correlation analysis demonstrates that the input features exhibit near-zero linear and non-linear correlation with the target severity label. In statistical machine learning, when features lack deterministic predictive signal, the Bayes optimal decision boundary cannot exceed the baseline prior probability distribution (which is 25.0% for 4 balanced classes). Documenting this honestly reflects scientific rigor rather than fabricating unrealistic 98% accuracy claims."
  },
  {
    q: "How is the model deployed serverlessly on Vercel?",
    a: "The entire preprocessing and XGBoost classification pipeline is serialized into a compact 0.34 MB joblib artifact ('accident_severity_model.pkl'). A lightweight Python serverless function ('api/predict.py') loads this artifact into memory once upon container initialization. When a user submits features via the Next.js frontend, a POST request delivers JSON payloads to '/api/predict', producing predictions in under 30 milliseconds within Vercel's 50MB function bundle constraints."
  }
];

export default function AboutPage() {
  const [openVivaIdx, setOpenVivaIdx] = useState(0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
          <BookOpen size={15} />
          <span>Academic Mini-Project Documentation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          About RoadSense India & Research Methodology
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          B.Tech Computer Science Engineering • Introduction to Machine Learning • Topic 25: Road Accident Severity Prediction.
        </p>
      </div>

      {/* Abstract & Executive Summary */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-blue-400" />
          <span>Executive Abstract</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          Road traffic accidents present a grave socio-economic challenge across developing nations, with India accounting for a significant share of global vehicular fatalities. This project formulates road accident severity prediction as a supervised multiclass classification problem over four severity classes: <strong>Minor</strong>, <strong>Moderate</strong>, <strong>Severe</strong>, and <strong>Fatal</strong>. Using an Indian road accident dataset encompassing 500,000 records across 28 states and 491 municipalities, we implement and benchmark three classic machine learning architectures: <strong>Decision Tree Classifier</strong>, <strong>Random Forest Classifier</strong>, and <strong>Extreme Gradient Boosting (XGBoost)</strong>. The entire pipeline is exported and hosted via a modern Next.js and Python serverless cloud architecture on Vercel.
        </p>
      </div>

      {/* Problem Statement & Objectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-white">Problem Statement</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Traffic accidents result from complex interactions between geographic factors, temporal rhythms (hour of day, day of week), road design (highways, expressways, lane counts, traffic signals), and ambient weather conditions (rain, fog, temperature). Identifying risk determinants prior to or during incident occurrence enables emergency logistics teams, highway authorities, and urban planners to prioritize safety interventions.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-white">Project Objectives</h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Curate, inspect, and verify 500,000 preprocessed Indian road accident records without missing values or target leakage.</li>
            <li>Conduct comprehensive Exploratory Data Analysis (EDA) across 12 publication-quality visualizations.</li>
            <li>Train, tune, and evaluate Decision Tree, Random Forest, and XGBoost using stratified 80:20 splits.</li>
            <li>Prevent data leakage using Scikit-learn Pipeline and ColumnTransformer.</li>
            <li>Deploy a production-grade full-stack web application on Vercel with an interactive Leaflet India accident map and real-time prediction API.</li>
          </ul>
        </div>
      </div>

      {/* Technical Workflow & Methodology */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <GitBranch size={18} className="text-cyan-400" />
          <span>Machine Learning Lifecycle & Engineering Methodology</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-400 block text-xs">1. Preprocessing Pipeline</span>
            <p className="text-slate-400 leading-relaxed">
              Numerical features (month, hour, lanes, traffic_signal, temperature) are processed using median imputation. Categorical attributes (city, state, road_type, weather, visibility, traffic_density, festival) are transformed via <code className="text-slate-200">OneHotEncoder(handle_unknown='ignore')</code> inside a unified <code className="text-slate-200">ColumnTransformer</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <span className="font-bold text-blue-400 block text-xs">2. Model Benchmarking</span>
            <p className="text-slate-400 leading-relaxed">
              Models are trained on 400,000 observations using identical stratified random seeds. Decision Tree uses Gini Impurity with max_depth=12; Random Forest constructs 50 trees with parallel bootstrap sampling; XGBoost optimizes multiclass log-loss with learning rate 0.1 and 60 sequential boosting iterations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 block text-xs">3. Serverless Deployment</span>
            <p className="text-slate-400 leading-relaxed">
              The winning XGBoost pipeline is compressed to 0.34 MB using joblib. Vercel deploys Next.js alongside Python serverless functions, guaranteeing low latency inference under 30ms without requiring dedicated cloud server instances.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Provenance & Limitations */}
      <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-800/50 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <ShieldAlert size={18} />
          <span>Dataset Provenance & Scientific Limitations</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Academic Transparency Note:</strong> While this dataset reflects realistic Indian geographical naming (28 states, 491 municipalities) and standard road safety attributes, statistical tests verify that the 4 severity categories exhibit near-uniform 25.0% distributions with negligible pairwise feature correlations. This is characteristic of simulated or benchmark data. Consequently, predictions should be viewed as an academic demonstration of machine learning engineering pipelines and must not be used for real-world life-critical traffic emergency management.
        </p>
      </div>

      {/* Comprehensive Viva Voce Questions & Answers */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle size={18} className="text-cyan-400" />
              <span>B.Tech Project Viva Voce Preparation Guide (8 Questions)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Key theoretical and practical questions frequently asked by academic examiners.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-blue-500/10 text-cyan-400 font-mono">
            Exam Ready
          </span>
        </div>

        <div className="space-y-3">
          {VIVA_QUESTIONS.map((item, idx) => {
            const isOpen = openVivaIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-slate-800/40 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenVivaIdx(isOpen ? -1 : idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-slate-800/60 transition-colors"
                >
                  <span className="font-semibold text-slate-200 text-xs md:text-sm">
                    Q{idx + 1}: {item.q}
                  </span>
                  <div className="text-slate-400 shrink-0">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 text-xs text-slate-300 border-t border-slate-800/60 bg-slate-900/40 leading-relaxed">
                    <strong className="text-cyan-400 block mb-1">Answer & Explanation:</strong>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

