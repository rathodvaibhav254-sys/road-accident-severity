# Academic Project Report
## Road Accident Severity Prediction Using Machine Learning Algorithms

**Academic Degree:** Bachelor of Technology in Computer Science & Engineering  
**Subject:** Introduction to Machine Learning (Topic 25)  
**Project Platform:** RoadSense India  

---

### Table of Contents
1. [Abstract](#1-abstract)
2. [Introduction & Background](#2-introduction--background)
3. [Problem Statement](#3-problem-statement)
4. [Project Objectives](#4-project-objectives)
5. [Literature Review](#5-literature-review)
6. [Dataset Description & Audit](#6-dataset-description--audit)
7. [Exploratory Data Analysis (EDA)](#7-exploratory-data-analysis-eda)
8. [Data Preprocessing & Leakage Prevention](#8-data-preprocessing--leakage-prevention)
9. [Machine Learning Algorithms & Mathematical Formulation](#9-machine-learning-algorithms--mathematical-formulation)
10. [Implementation Architecture](#10-implementation-architecture)
11. [Results & Comparative Discussion](#11-results--comparative-discussion)
12. [Geospatial Analytics & Interactive India Mapping](#12-geospatial-analytics--interactive-india-mapping)
13. [Limitations & Dataset Provenance](#13-limitations--dataset-provenance)
14. [Future Scope](#14-future-scope)
15. [Viva Voce Examination Guide](#15-viva-voce-examination-guide)
16. [References](#16-references)

---

### 1. Abstract
Road vehicular collisions represent a major public health hazard and socio-economic burden globally. In rapidly motorizing developing economies such as India, road safety analytics provide essential insights for emergency services, transportation authorities, and municipal planners. This project formulates road accident severity estimation as a supervised multiclass classification problem over four severity classes: **Minor**, **Moderate**, **Severe**, and **Fatal**. Using a cleaned dataset of **500,000 accident records** spanning 28 Indian states and 491 municipalities, we design an end-to-end Machine Learning pipeline utilizing Scikit-learn `ColumnTransformer` and benchmark three core algorithms: **Decision Tree Classifier**, **Random Forest Classifier**, and **XGBoost Classifier**. Multiclass evaluation using stratified 80:20 partitioning reveals that XGBoost achieves the highest Macro F1-score (24.90%) across all four classes without severe class collapse. The optimized pipeline is exported as a lightweight 0.34 MB joblib artifact and deployed via a modern Next.js 14 and Python serverless architecture featuring an interactive Leaflet geospatial India map.

---

### 2. Introduction & Background
According to the Ministry of Road Transport and Highways (MoRTH) of India, hundreds of thousands of vehicular collisions take place annually. The severity of a collision is governed by an intricate confluence of environmental attributes (precipitation, ambient temperature, atmospheric visibility), road infrastructure features (lane count, traffic signal presence, roadway classification), and temporal factors (diurnal hour, weekday vs. weekend). 

Traditional accident severity analysis relied heavily on post-hoc statistical regressions that failed to capture high-dimensional non-linear interactions or generalize to real-time automated risk assessment. Supervised Machine Learning provides an empirical methodology to identify risk determinants and assign conditional probability distributions over discrete severity classes based solely on pre-incident and contextual variables.

---

### 3. Problem Statement
Given a vector of contextual pre-accident features $\mathbf{x} \in \mathcal{X}$ comprising geographic location ($city, state$), temporal variables ($month, hour, day\_of\_week$), infrastructural conditions ($road\_type, lanes, traffic\_signal$), and environmental dynamics ($weather, visibility, temperature, traffic\_density, festival$), develop a supervised classification model $f: \mathcal{X} \to \mathcal{Y}$ that accurately predicts the discrete severity level $y \in \{\text{Minor}, \text{Moderate}, \text{Severe}, \text{Fatal}\}$ without relying on post-accident telemetry (such as casualties or vehicle damage) that introduce target leakage.

---

### 4. Project Objectives
1. **Data Understanding & Hygiene:** Inspect and verify 500,000 Indian accident records, confirming zero missing values and zero duplicate rows.
2. **Exploratory Visual Analysis:** Generate 12 publication-quality visualizations analyzing class distributions, geographic counts, and cross-tabulations.
3. **Leakage-Free Preprocessing:** Structure a Scikit-learn pipeline using `ColumnTransformer` with `SimpleImputer` and `OneHotEncoder(handle_unknown='ignore')` fitted strictly on training data.
4. **Multiclass Algorithm Comparison:** Train, evaluate, and benchmark Decision Tree, Random Forest, and XGBoost on an identical stratified split (400k train / 100k test).
5. **Rigorous Multiclass Metrics:** Measure performance using Macro F1-score, Weighted F1-score, Accuracy, Precision, Recall, and Confusion Matrices.
6. **Feature Importance Extraction:** Quantify relative Gini/Gain importance across top predictors.
7. **Production Cloud Deployment:** Build an enterprise-grade dark-themed web platform (RoadSense India) with Next.js, Python Serverless Functions, and an interactive India Leaflet accident map on Vercel.

---

### 5. Literature Review
- **Tree-Based Ensembles in Road Safety:** Research by Chang & Wang (2006) demonstrated that CART algorithms effectively handle non-linear interactions in crash severity modeling. Later studies by Abdel-Aty (2008) highlighted Random Forests for ranking environmental risk determinants.
- **Gradient Boosting in Multi-Class Domains:** Chen & Guestrin (2016) established XGBoost as an optimal gradient boosted decision tree framework that handles sparse one-hot encoded geographic features while controlling overfitting via regularized objective functions.
- **Data Leakage in Predictive Maintenance & Safety:** Kaufman et al. (2012) emphasized that models trained on post-event information (e.g., number of hospitalized victims) exhibit artificial near-perfect accuracy while proving completely useless for real-time prevention. Eliminating post-accident features is critical for valid inference.

---

### 6. Dataset Description & Audit
The dataset `road_accident_model_cleaned.csv` consists of exactly **500,000 observations and 14 columns**:

| # | Column Name | Data Type | Nature | Description / Domain |
|---|---|---|---|---|
| 1 | `city` | Categorical (String) | Geographic | 491 unique Indian municipal regions |
| 2 | `state` | Categorical (String) | Geographic | 28 Indian States & Federal territories |
| 3 | `month` | Numerical (Integer) | Temporal | Incident month (1 to 12) |
| 4 | `hour` | Numerical (Integer) | Temporal | Diurnal hour (0:00 to 23:00) |
| 5 | `day_of_week` | Categorical (String) | Temporal | Monday through Sunday |
| 6 | `road_type` | Categorical (String) | Infrastructure | Expressway, National Hwy, State Hwy, City, Rural |
| 7 | `lanes` | Numerical (Integer) | Infrastructure | Lane configurations (2, 4, 6 lanes) |
| 8 | `traffic_signal`| Numerical (Integer) | Infrastructure | 0 (No signal present), 1 (Traffic signal present) |
| 9 | `weather` | Categorical (String) | Environmental | Clear, Sunny, Rainy, Foggy, Cloudy |
| 10 | `visibility` | Categorical (String) | Environmental | Low, Medium, High visibility |
| 11 | `temperature` | Numerical (Float) | Environmental | Ambient temperature (5.0°C to 45.0°C) |
| 12 | `traffic_density`| Categorical (String) | Traffic Dynamic| Low, Medium, High, Choked |
| 13 | `festival` | Categorical (String) | Sociocultural | 10 cultural events (Diwali, Holi, Eid, Unknown, etc.) |
| 14 | `accident_severity`| Categorical (String) | **Target Variable**| **Minor (25.0%), Moderate (25.07%), Severe (24.9%), Fatal (25.02%)** |

- **Missing Values:** Exactly 0 missing entries across all 500,000 rows.
- **Duplicate Rows:** Exactly 0 duplicate observations.
- **Target Distribution:** Fully balanced four-class uniform split.

---

### 7. Exploratory Data Analysis (EDA)
12 dedicated visualizations were generated in `eda_plots/`:
1. **Accident Severity Distribution:** Confirms uniform balance across all 4 classes (~125,000 records each).
2. **Accident Volume by State:** Spans 28 states, with highest frequencies in high-density corridors.
3. **Top 20 Municipalities:** Shows broad regional coverage across 491 cities.
4. **Weather Condition Breakdown:** ~100,000 incidents per weather state (Clear, Rainy, Sunny, Foggy, Cloudy).
5. **Road Infrastructure Distribution:** Equal representation across Highways, Expressways, and City Roads.
6. **Lanes and Traffic Signals:** 50% split of traffic signal availability across 2, 4, and 6 lane designs.
7. **Diurnal Hourly Trends:** Hourly distribution across 0h to 23h averages ~20,800 incidents per hour.
8. **Day of Week Distribution:** Steady weekly accident counts (~71,400 per day from Monday to Sunday).
9. **Traffic Density vs. Severity:** Cross-tabulation confirms balanced severity proportions across Low, Medium, High, and Choked traffic.
10. **Road Type vs. Severity:** Proportional severity distribution across all road categories.
11. **Correlation Matrix:** Pearson correlation coefficients between numerical variables are virtually 0.000, confirming absence of collinearity.
12. **Visibility vs. Severity:** Evaluates accident distribution across Low, Medium, and High visibility strata.

---

### 8. Data Preprocessing & Leakage Prevention
To ensure strict statistical validity:
- **Stratified Partitioning:** An 80:20 stratified train-test split (`random_state=42`) allocates 400,000 training records and 100,000 holdout test cases. Stratification guarantees identical class ratios in both splits.
- **Scikit-learn ColumnTransformer:**
  - *Numerical Transformer:* `SimpleImputer(strategy='median')` applied to `['month', 'hour', 'lanes', 'traffic_signal', 'temperature']`.
  - *Categorical Transformer:* `OneHotEncoder(handle_unknown='ignore', sparse_output=True)` applied to `['city', 'state', 'day_of_week', 'road_type', 'weather', 'visibility', 'traffic_density', 'festival']`.
- **Target Encoding:** Mapped explicitly: `Minor: 0`, `Moderate: 1`, `Severe: 2`, `Fatal: 3`.

---

### 9. Machine Learning Algorithms & Mathematical Formulation

#### A. Decision Tree Classifier
A Decision Tree recursively partitions feature space into axis-aligned hyper-rectangles. At each node $m$, the algorithm selects the feature $j$ and split threshold $t$ that minimizes Gini Impurity:
$$G(m) = 1 - \sum_{k=1}^{K} p_{mk}^2$$
where $p_{mk}$ represents the proportion of class $k$ in node $m$. The Information Gain is:
$$\Delta G = G(m) - \left( \frac{N_L}{N_m} G(m_L) + \frac{N_R}{N_m} G(m_R) \right)$$
Hyperparameters utilized: `max_depth=12`, `min_samples_split=25`, `min_samples_leaf=15`.

#### B. Random Forest Classifier
Random Forest is an ensemble of $B$ independent decision trees trained with Bootstrap Aggregation (Bagging). Each tree $T_b$ is trained on a bootstrap sample $D_b \sim D$ with feature subsampling ($m = \sqrt{p}$). Prediction is obtained by unweighted majority voting:
$$\hat{y} = \arg\max_k \frac{1}{B} \sum_{b=1}^{B} I(T_b(\mathbf{x}) = k)$$
Hyperparameters utilized: `n_estimators=50`, `max_depth=12`, `min_samples_split=25`, `min_samples_leaf=15`, `n_jobs=-1`.

#### C. Extreme Gradient Boosting (XGBoost)
XGBoost builds trees additively by optimizing a regularized objective function:
$$\mathcal{L}^{(t)} = \sum_{i=1}^n l\left(y_i, \hat{y}_i^{(t-1)} + f_t(\mathbf{x}_i)\right) + \Omega(f_t)$$
where $\Omega(f_t) = \gamma T + \frac{1}{2} \lambda \sum_{j=1}^T w_j^2$. Using second-order Taylor expansion:
$$\mathcal{L}^{(t)} \approx \sum_{i=1}^n \left[ g_i f_t(\mathbf{x}_i) + \frac{1}{2} h_i f_t^2(\mathbf{x}_i) \right] + \Omega(f_t)$$
where $g_i$ and $h_i$ are the first and second order gradients of the multiclass cross-entropy loss. Hyperparameters utilized: `n_estimators=60`, `max_depth=6`, `learning_rate=0.1`, `subsample=0.8`, `colsample_bytree=0.8`.

---

### 10. Implementation Architecture
The platform is organized into a modular full-stack repository:
- **Backend API (`api/predict.py`):** Serverless Python handler that deserializes `accident_severity_model.pkl` once and serves real-time JSON inference.
- **Frontend Framework (Next.js 14):** Responsive dark-theme dashboard featuring Overview, Map, Predict, Dataset, Analytics, and About pages.
- **Geospatial Mapping (`react-leaflet`):** Client-side interactive mapping over 491 verified municipal centroid coordinates and 28 state bounds.

---

### 11. Results & Comparative Discussion

#### Quantitative Benchmark on 100,000 Test Records:
| Algorithm | Test Accuracy | Macro Precision | Macro Recall | Macro F1-Score | Weighted F1 | Overfitting Gap |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Decision Tree** | 25.16% | 25.20% | 25.13% | 17.27% | 17.28% | 0.33% |
| **Random Forest** | 24.87% | 24.84% | 24.84% | 23.76% | 23.77% | 4.50% |
| **XGBoost (Best)** | **25.18%** | **25.18%** | **25.17%** | **24.90%** | **24.91%** | 5.27% |

#### Confusion Matrix & Per-Class Analysis:
- **Decision Tree Class Collapse:** The standalone decision tree exhibited severe bias toward the `Moderate` class (Recall: 76.9%), while virtually failing on `Minor` (Recall: 4.2%) and `Fatal` (Recall: 1.7%). This caused its Macro F1-score to collapse to 17.27%.
- **XGBoost Class Balance:** XGBoost maintained consistent recall across all four classes (Minor: 23.9%, Moderate: 34.2%, Severe: 19.8%, Fatal: 22.7%), achieving the highest Macro F1-score of 24.90%.
- **Winning Selection:** XGBoost was selected as the production inference model.

---

### 12. Geospatial Analytics & Interactive India Mapping
To provide actionable spatial intelligence:
- 491 Indian municipal centroids were verified across 28 states.
- Dual visual modes enable toggling between city-level severity markers and state-level proportional density circles.
- Interactive popups render localized accident totals, dominant severity status, and weather breakdown.
- Dynamic filtering smoothly flies the map camera to selected states and cities.

---

### 13. Limitations & Dataset Provenance
1. **Synthetic Uniformity:** The 500,000-record dataset displays statistical uniformity across features and target labels (25.0% flat distribution). In real-world police accident records, Minor and Moderate accidents significantly outnumber Fatal incidents.
2. **Feature-Label Independence:** The mathematical correlation between input conditions and the target severity is near zero, bounding predictive accuracy to the prior random baseline (~25%).
3. **Centroid Representation:** Raw accident GPS coordinates were unavailable; city-level aggregate centroids are used as geographic representations.

---

### 14. Future Scope
1. Ingest verified real-world telemetry from state highway traffic surveillance databases (e.g., CCTNS / MoRTH).
2. Integrate real-time weather API feeds (OpenWeatherMap / IMD) for automated incident weather fetching.
3. Incorporate vehicle telemetry (vehicle age, vehicle type, speed estimates) to improve classification resolution.
4. Experiment with Deep Neural Networks (TabNet / Multi-Layer Perceptrons) for high-dimensional categorical embeddings.

---

### 15. Viva Voce Examination Guide
*(Refer to Section 6 of the About Page in the web application or README for the complete set of 8 detailed theoretical questions and answers).*

---

### 16. References
1. Ministry of Road Transport and Highways (MoRTH), "Road Accidents in India 2022," Government of India, 2023.
2. Chen, T., & Guestrin, C. (2016). "XGBoost: A Scalable Tree Boosting System." *ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*.
3. Breiman, L. (2001). "Random Forests." *Machine Learning*, 45(1), 5-32.
4. Pedregosa, F., et al. (2011). "Scikit-learn: Machine Learning in Python." *Journal of Machine Learning Research*, 12, 2825-2830.
5. Chang, L. Y., & Wang, H. W. (2006). "Analysis of traffic injury severity: An application of non-parametric classification tree techniques." *Accident Analysis & Prevention*, 38(5), 1019-1027.

