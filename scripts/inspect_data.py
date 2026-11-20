import os
import json
import pandas as pd
import numpy as np

def inspect_dataset(data_path="data/road_accident_model_cleaned.csv"):
    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    shape = df.shape
    print(f"Dataset Shape: {shape[0]:,} rows, {shape[1]} columns")
    
    columns = list(df.columns)
    print(f"Columns: {columns}")
    
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
    missing_vals = df.isnull().sum().to_dict()
    duplicates_count = int(df.duplicated().sum())
    
    print(f"Total Duplicate Rows: {duplicates_count:,}")
    
    # Class distribution
    target_col = 'accident_severity'
    if target_col in df.columns:
        class_dist = df[target_col].value_counts().to_dict()
        class_dist_pct = (df[target_col].value_counts(normalize=True) * 100).round(2).to_dict()
    else:
        class_dist = {}
        class_dist_pct = {}
        
    print("\nTarget Class Distribution:")
    for k, v in class_dist.items():
        print(f"  {k}: {v:,} ({class_dist_pct[k]}%)")
        
    # Unique values of categorical features
    cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    unique_categories = {}
    for col in cat_cols:
        unique_vals = df[col].unique().tolist()
        unique_categories[col] = {
            "count": len(unique_vals),
            "sample_values": [str(x) for x in unique_vals[:20]]
        }
        
    # Descriptive statistics for numerical features
    num_summary = df.describe().round(2).to_dict()
    
    # First 5 records
    head_records = df.head(5).to_dict(orient='records')
    
    summary = {
        "shape": {"rows": shape[0], "columns": shape[1]},
        "columns": columns,
        "dtypes": dtypes,
        "missing_values": missing_vals,
        "duplicate_rows": duplicates_count,
        "target_distribution": {
            "counts": class_dist,
            "percentages": class_dist_pct
        },
        "categorical_columns": cat_cols,
        "numerical_columns": num_cols,
        "categorical_uniques": unique_categories,
        "numerical_statistics": num_summary,
        "head_5_records": head_records
    }
    
    os.makedirs("results", exist_ok=True)
    with open("results/phase1_data_summary.json", "w") as f:
        json.dump(summary, f, indent=2, default=str)
        
    print("\nPhase 1 Data Inspection Completed Successfully!")
    print("Summary saved to results/phase1_data_summary.json")

if __name__ == "__main__":
    inspect_dataset()

