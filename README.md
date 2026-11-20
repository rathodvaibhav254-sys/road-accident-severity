# RoadSense India: Road Accident Severity Prediction & Geospatial Safety Intelligence

An end-to-end Machine Learning and Geospatial Analytics platform developed as a B.Tech Computer Science Mini-Project for **Introduction to Machine Learning (Topic 25)**.

The system investigates environmental, infrastructural, and temporal determinants across **500,000 Indian accident records**, benchmarks three classification architectures (**Decision Tree**, **Random Forest**, and **XGBoost**), and deploys the optimized model via a modern **Next.js and Python Serverless** cloud web application on Vercel.

---

## 🌟 Key Application Features

1. **Overview Analytics Dashboard**:
   - High-level KPIs across 500,000 records and 4 severity classes (*Minor*, *Moderate*, *Severe*, *Fatal*).
   - Dynamic interactive filters for State, City, Severity, Weather, and Road Type.
   - Interactive Recharts visualizing temporal trends (24-hour diurnal curve), geographic volume, road classifications, and weather interactions.

2. **Interactive India Accident Map**:
   - Geospatial visualization powered by React Leaflet with CartoDB Dark Matter tiles.
   - Centered on India with exploration across **491 verified city centroids** and **28 state jurisdictions**.
   - Dual modes: **City Aggregate Markers** (scaled and color-coded by dominant severity) and **State Density Aggregations**.
   - Interactive popups with accident volume, severity breakdown, and infrastructure attributes.
   - Transparent geographic integrity notice distinguishing municipal aggregations from individual crash telemetry.

3. **Real-Time Machine Learning Predictor**:
   - Multi-parameter input form capturing 13 incident features.
   - Dependent state-to-city dynamic dropdowns.
   - Direct asynchronous HTTP POST call to the Python machine learning backend.
   - Four-class severity classification badge, softmax confidence estimates, and academic interpretation.

4. **Cleaned Dataset Explorer**:
   - Real-time search, multi-attribute filtering, and pagination over representative incident records.
   - Complete data dictionary and zero-missing-value data quality verification.
   - One-click filtered CSV export.

5. **Model Performance & Scientific Benchmarks**:
   - Comprehensive comparative analytics across Decision Tree, Random Forest, and XGBoost.
   - Empirical evaluation metrics: Accuracy, Macro Precision, Macro Recall, Macro F1-score, Weighted F1-score, and Overfitting Gaps.
   - Confusion matrices and per-class precision/recall classification reports for all three algorithms.
   - Top 15 Feature Importances extracted from the tree ensemble.
   - Theoretical explanations of Gini Impurity, Information Gain, Bagging, and Gradient Boosting.

6. **Academic Documentation & Viva Voce Guide**:
   - Complete project abstract, objectives, literature context, and methodology.
   - 8 comprehensive Viva Voce questions with detailed theoretical explanations for university examination.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router), React 18, React DOM |
| **Styling & Design System** | Tailwind CSS (Navy/Dark Slate Theme), Lucide React Icons |
| **Data Visualizations** | Recharts (Responsive SVG charts) |
| **Geospatial Mapping** | React Leaflet, Leaflet, CartoDB Dark Matter tiles |
| **Machine Learning Backend** | Python 3.13, Scikit-learn, XGBoost, Pandas, NumPy, Joblib |
| **Model Serialization** | Compressed Scikit-learn Pipeline artifact (`accident_severity_model.pkl`, 0.34 MB) |
| **Serverless Deployment** | Vercel (Next.js + Python Serverless Runtime) |

---

## 📊 Machine Learning Model Comparison Results

All three models were trained on **400,000 observations (80%)** and evaluated on **100,000 holdout test cases (20%)** using a stratified split:

| Model Architecture | Test Accuracy | Macro F1-Score | Weighted F1 | Train Accuracy | Overfitting Gap | Training Time |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Decision Tree** | 25.16% | 17.27% | 17.28% | 25.49% | 0.33% | 3.86s |
| **Random Forest** | 24.87% | 23.76% | 23.77% | 29.36% | 4.50% | 5.14s |
| **XGBoost (Best)** | **25.18%** | **24.90%** | **24.91%** | 30.45% | 5.27% | 6.07s |

### Scientific Finding & Academic Integrity Note
The four target classes are uniformly distributed (~25.0% each). Correlation analysis reveals that the input features exhibit near-zero linear or non-linear correlation with the severity label. In accordance with Bayes decision theory, when features lack deterministic signal, the optimal classification boundary aligns with the prior probability (25.0%). Rather than inventing fabricated accuracy claims, this behavior is documented honestly as an essential academic learning outcome.

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- Python 3.10+ (tested on Python 3.13)
- Git

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/<your-username>/roadsense-india.git
cd roadsense-india

# Install Python requirements
pip install -r requirements.txt

# Install Node.js frontend dependencies
npm install
```

### 2. Run the Machine Learning Pipeline (Optional if already trained)

The repository already contains the trained `accident_severity_model.pkl` (0.34 MB) and pre-aggregated JSON datasets. To re-run EDA and training:

```bash
# Inspect dataset
python scripts/inspect_data.py

# Generate 12 EDA visualizations
python scripts/run_eda.py

# Train & evaluate Decision Tree, Random Forest, and XGBoost
python scripts/train_models.py

# Generate frontend optimized JSON data
python scripts/prepare_frontend_data.py
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment to Vercel

The application is structured for instant zero-configuration deployment on **Vercel**:

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial release of RoadSense India"
   git remote add origin https://github.com/<your-username>/roadsense-india.git
   git push -u origin main
   ```

2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. Framework Preset: **Next.js** (automatically detected).
5. Ensure Root Directory is set to `./`.
6. Click **Deploy**.
7. Vercel automatically builds the Next.js frontend and provisions the Python Serverless Function (`api/predict.py`) under 1-2 minutes.

---

## 📁 Repository Structure

```
├── accident_severity_model.pkl      # Trained XGBoost classification pipeline (0.34 MB)
├── api/
│   ├── predict.py                   # Vercel Python serverless prediction handler
│   └── accident_severity_model.pkl  # Colocated model artifact
├── data/
│   └── road_accident_model_cleaned.csv # 500,000 cleaned Indian accident records (40.8 MB)
├── eda_plots/                       # 12 high-resolution EDA figures + model evaluation charts
├── public/
│   ├── data/                        # Optimized JSON aggregations for sub-millisecond client loading
│   └── plots/                       # Copied visual artifacts
├── results/
│   ├── eda_findings.json            # Statistical interpretations of all EDA plots
│   ├── model_metadata.json          # Complete metrics, confusion matrices, and feature importances
│   └── phase1_data_summary.json     # Data types, missing values, and distribution audits
├── scripts/
│   ├── inspect_data.py              # Phase 1 dataset inspection script
│   ├── run_eda.py                   # Phase 2 EDA generation script
│   ├── train_models.py              # Phase 3-5 ML training & evaluation script
│   ├── prepare_frontend_data.py     # Aggregation & geographic centroid builder
│   └── test_api_server.py           # End-to-end integration testing script
├── src/
│   ├── app/
│   │   ├── layout.jsx               # Root navigation shell & sidebar wrapper
│   │   ├── page.jsx                 # Overview Analytics Dashboard
│   │   ├── globals.css              # Tailwind + Leaflet styles
│   │   ├── about/page.jsx           # Methodology & Viva Voce Q&A
│   │   ├── analytics/page.jsx       # Model Performance & Benchmarks
│   │   ├── dataset/page.jsx         # Cleaned Dataset Explorer
│   │   ├── map/page.jsx             # India Geospatial Accident Map
│   │   ├── predict/page.jsx         # Real-time Prediction UI
│   │   └── api/predict/route.js     # Next.js API route fallback & proxy
│   └── components/
│       ├── IndiaMap.jsx             # Leaflet dynamic client-side map
│       ├── SeverityBadge.jsx        # Standardized severity tags
│       ├── Sidebar.jsx              # Navigation sidebar
│       └── TopNav.jsx               # Top navigation bar
├── next.config.js                   # Next.js configuration
├── package.json                     # Node.js dependencies
├── requirements.txt                 # Python dependencies for Vercel
├── tailwind.config.js               # Theme & color tokens
└── vercel.json                      # Vercel routing rules
```

---

## 📜 Academic Project Submission Details

- **Course:** Introduction to Machine Learning (B.Tech Computer Science & Engineering)
- **Topic:** Topic 25 — Road Accident Severity Prediction Using Machine Learning
- **Target Classes:** Minor (0), Moderate (1), Severe (2), Fatal (3)
- **Supervised Learning Formulation:** 4-Class Classification using Tree Ensembles
- **Primary Metrics:** Macro F1-Score, Multi-class Accuracy, Confusion Matrix, Classification Report

