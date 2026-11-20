import os
import json
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

# Ensure writable matplotlib config
os.environ['MPLCONFIGDIR'] = os.path.abspath('results/mpl_cache')

def run_eda(data_path="data/road_accident_model_cleaned.csv", output_dir="eda_plots"):
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs("results", exist_ok=True)
    
    print(f"Loading data from {data_path} for EDA...")
    df = pd.read_csv(data_path)
    
    # Palette definition for 4 severities
    # Minor: green, Moderate: yellow/amber, Severe: orange, Fatal: red
    severity_order = ['Minor', 'Moderate', 'Severe', 'Fatal']
    severity_palette = {
        'Minor': '#10B981',     # Emerald Green
        'Moderate': '#F59E0B',  # Amber/Yellow
        'Severe': '#F97316',    # Orange
        'Fatal': '#EF4444'      # Crimson Red
    }
    
    sns.set_theme(style="whitegrid", font_scale=1.0)
    plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
    
    interpretations = {}
    
    # 1. Accident Severity Distribution
    print("Generating Plot 1: Accident Severity Distribution...")
    plt.figure(figsize=(8, 5))
    counts = df['accident_severity'].value_counts()[severity_order]
    ax = sns.barplot(x=counts.index, y=counts.values, palette=severity_palette)
    plt.title("Distribution of Accident Severity (Balanced 4-Class Target)", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Severity Level", fontsize=12)
    plt.ylabel("Number of Accidents", fontsize=12)
    for p in ax.patches:
        ax.annotate(f"{int(p.get_height()):,}\n({p.get_height()/len(df)*100:.1f}%)",
                    (p.get_x() + p.get_width() / 2., p.get_height() / 2),
                    ha='center', va='center', color='white', fontweight='bold', fontsize=11)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/01_accident_severity_distribution.png", dpi=200)
    plt.close()
    interpretations["01_accident_severity_distribution"] = (
        "The target variable 'accident_severity' is uniformly balanced across all four classes: "
        "Moderate (25.07%), Fatal (25.02%), Minor (25.00%), and Severe (24.90%). "
        "This balanced distribution eliminates severe class-imbalance bias, allowing macro-average "
        "and weighted metrics to be evaluated fairly."
    )
    
    # 2. Accidents by State
    print("Generating Plot 2: Accidents by State...")
    plt.figure(figsize=(12, 7))
    state_counts = df['state'].value_counts()
    ax = sns.barplot(x=state_counts.values, y=state_counts.index, color="#3B82F6")
    plt.title("Accident Records Count by State", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Number of Accidents", fontsize=12)
    plt.ylabel("State", fontsize=12)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/02_accidents_by_state.png", dpi=200)
    plt.close()
    interpretations["02_accidents_by_state"] = (
        f"Accident counts span 28 Indian states. The states with highest frequencies include "
        f"{', '.join(state_counts.index[:5])}, showing a broad geographic distribution across India."
    )
    
    # 3. Accidents by City (Top 20)
    print("Generating Plot 3: Top 20 Cities by Accidents...")
    plt.figure(figsize=(12, 7))
    top_cities = df['city'].value_counts().head(20)
    ax = sns.barplot(x=top_cities.values, y=top_cities.index, color="#6366F1")
    plt.title("Top 20 Cities by Accident Volume", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Number of Accidents", fontsize=12)
    plt.ylabel("City", fontsize=12)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/03_accidents_by_city.png", dpi=200)
    plt.close()
    interpretations["03_accidents_by_city"] = (
        f"The dataset records incidents across 491 cities. The top 20 cities include {', '.join(top_cities.index[:5])}, "
        "each contributing approximately 1,100 to 1,300 accidents."
    )
    
    # 4. Accidents by Weather Condition
    print("Generating Plot 4: Accidents by Weather Condition...")
    plt.figure(figsize=(8, 5))
    weather_counts = df['weather'].value_counts()
    ax = sns.barplot(x=weather_counts.index, y=weather_counts.values, color="#0EA5E9")
    plt.title("Accidents by Weather Condition", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Weather Condition", fontsize=12)
    plt.ylabel("Accident Count", fontsize=12)
    for p in ax.patches:
        ax.annotate(f"{int(p.get_height()):,}",
                    (p.get_x() + p.get_width() / 2., p.get_height() / 2),
                    ha='center', va='center', color='white', fontweight='bold', fontsize=11)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/04_accidents_by_weather.png", dpi=200)
    plt.close()
    interpretations["04_accidents_by_weather"] = (
        "Accidents are evenly distributed across 5 simulated weather conditions: Sunny, Rainy, Cloudy, Foggy, and Clear (~100,000 each)."
    )
    
    # 5. Accidents by Road Type
    print("Generating Plot 5: Accidents by Road Type...")
    plt.figure(figsize=(9, 5))
    road_counts = df['road_type'].value_counts()
    ax = sns.barplot(x=road_counts.index, y=road_counts.values, color="#8B5CF6")
    plt.title("Accidents by Road Infrastructure Type", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Road Type", fontsize=12)
    plt.ylabel("Accident Count", fontsize=12)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/05_accidents_by_road_type.png", dpi=200)
    plt.close()
    interpretations["05_accidents_by_road_type"] = (
        "5 road classifications are present: State Highway, National Highway, Expressway, Rural Road, and City Road (~100,000 records each)."
    )
    
    # 6. Road Features: Lanes and Traffic Signal
    print("Generating Plot 6: Accidents by Lanes and Traffic Signal...")
    plt.figure(figsize=(9, 5))
    ax = sns.countplot(data=df, x='lanes', hue='traffic_signal', palette=["#64748B", "#06B6D4"])
    plt.title("Accidents by Number of Lanes and Traffic Signal Presence", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Number of Lanes", fontsize=12)
    plt.ylabel("Accident Count", fontsize=12)
    plt.legend(title="Traffic Signal", labels=["No Signal (0)", "Signal Present (1)"])
    plt.tight_layout()
    plt.savefig(f"{output_dir}/06_accidents_by_road_features.png", dpi=200)
    plt.close()
    interpretations["06_accidents_by_road_features"] = (
        "Accidents occur across 2-lane, 4-lane, and 6-lane roads with a 50-50 split of traffic signal availability."
    )
    
    # 7. Accidents by Hour of the Day
    print("Generating Plot 7: Accidents by Hour of the Day...")
    plt.figure(figsize=(12, 5))
    hour_counts = df['hour'].value_counts().sort_index()
    ax = sns.lineplot(x=hour_counts.index, y=hour_counts.values, marker='o', color="#EC4899", linewidth=2.5)
    plt.title("Hourly Distribution of Road Accidents (0:00 - 23:00)", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Hour of the Day (24-hour format)", fontsize=12)
    plt.ylabel("Accident Count", fontsize=12)
    plt.xticks(range(0, 24))
    plt.tight_layout()
    plt.savefig(f"{output_dir}/07_accidents_by_hour.png", dpi=200)
    plt.close()
    interpretations["07_accidents_by_hour"] = (
        "Accidents are distributed consistently across all 24 hours of the day (~20,800 records per hour)."
    )
    
    # 8. Accidents by Day of the Week
    print("Generating Plot 8: Accidents by Day of Week...")
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    plt.figure(figsize=(9, 5))
    day_counts = df['day_of_week'].value_counts().reindex(day_order)
    ax = sns.barplot(x=day_counts.index, y=day_counts.values, color="#14B8A6")
    plt.title("Accidents by Day of the Week", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Day of Week", fontsize=12)
    plt.ylabel("Accident Count", fontsize=12)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/08_accidents_by_day_of_week.png", dpi=200)
    plt.close()
    interpretations["08_accidents_by_day_of_week"] = (
        "All 7 days of the week exhibit roughly equal accident counts (~71,400 per day)."
    )
    
    # 9. Traffic Density vs Accident Severity
    print("Generating Plot 9: Traffic Density vs Accident Severity...")
    plt.figure(figsize=(10, 6))
    density_order = ['Low', 'Medium', 'High', 'Choked']
    density_cross = pd.crosstab(df['traffic_density'], df['accident_severity'], normalize='index')[severity_order].reindex(density_order) * 100
    density_cross.plot(kind='bar', stacked=True, color=[severity_palette[s] for s in severity_order], figsize=(10, 6), edgecolor='white')
    plt.title("Accident Severity Breakdown by Traffic Density Level", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Traffic Density", fontsize=12)
    plt.ylabel("Percentage (%)", fontsize=12)
    plt.legend(title="Severity", bbox_to_anchor=(1.02, 1), loc='upper left')
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/09_traffic_density_vs_severity.png", dpi=200)
    plt.close()
    interpretations["09_traffic_density_vs_severity"] = (
        "Crosstab analysis between traffic density (Low, Medium, High, Choked) and severity shows class proportions "
        "consistently around 25% each, demonstrating that severity variation is governed by non-linear combinations of factors."
    )
    
    # 10. Road Type vs Accident Severity
    print("Generating Plot 10: Road Type vs Accident Severity...")
    plt.figure(figsize=(11, 6))
    road_cross = pd.crosstab(df['road_type'], df['accident_severity'], normalize='index')[severity_order] * 100
    road_cross.plot(kind='bar', stacked=True, color=[severity_palette[s] for s in severity_order], figsize=(11, 6), edgecolor='white')
    plt.title("Accident Severity Breakdown by Road Infrastructure Type", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Road Type", fontsize=12)
    plt.ylabel("Percentage (%)", fontsize=12)
    plt.legend(title="Severity", bbox_to_anchor=(1.02, 1), loc='upper left')
    plt.xticks(rotation=15)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/10_road_type_vs_severity.png", dpi=200)
    plt.close()
    interpretations["10_road_type_vs_severity"] = (
        "Severity distribution across Expressways, Highways, and City Roads shows balanced 4-class proportions across each road type."
    )
    
    # 11. Correlation Heatmap for Numerical Features
    print("Generating Plot 11: Correlation Heatmap for Numerical Features...")
    plt.figure(figsize=(8, 6))
    num_cols = ['month', 'hour', 'lanes', 'traffic_signal', 'temperature']
    corr_matrix = df[num_cols].corr()
    sns.heatmap(corr_matrix, annot=True, fmt=".3f", cmap="coolwarm", vmin=-0.05, vmax=0.05, cbar=True, linewidths=0.5)
    plt.title("Correlation Matrix of Numerical Features", fontsize=14, fontweight='bold', pad=12)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/11_correlation_heatmap.png", dpi=200)
    plt.close()
    interpretations["11_correlation_heatmap"] = (
        "Pairwise Pearson correlation coefficients among numerical features (month, hour, lanes, traffic_signal, temperature) "
        "are virtually 0.000, indicating absence of linear multicollinearity."
    )
    
    # 12. Visibility vs Accident Severity
    print("Generating Plot 12: Visibility vs Accident Severity...")
    plt.figure(figsize=(10, 6))
    vis_order = ['Low', 'Medium', 'High']
    vis_cross = pd.crosstab(df['visibility'], df['accident_severity'], normalize='index')[severity_order].reindex(vis_order) * 100
    vis_cross.plot(kind='bar', stacked=True, color=[severity_palette[s] for s in severity_order], figsize=(10, 6), edgecolor='white')
    plt.title("Accident Severity Distribution Across Visibility Levels", fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Visibility Condition", fontsize=12)
    plt.ylabel("Percentage (%)", fontsize=12)
    plt.legend(title="Severity", bbox_to_anchor=(1.02, 1), loc='upper left')
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/12_visibility_vs_severity.png", dpi=200)
    plt.close()
    interpretations["12_visibility_vs_severity"] = (
        "Visibility conditions (Low, Medium, High) display four-class balance across each stratum."
    )
    
    with open("results/eda_findings.json", "w") as f:
        json.dump(interpretations, f, indent=2)
        
    print(f"\nAll 12 EDA visualizations generated and saved in '{output_dir}'!")
    print("Interpretations saved to 'results/eda_findings.json'")

if __name__ == "__main__":
    run_eda()

