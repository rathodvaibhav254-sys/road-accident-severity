import os
import json
import time
import joblib
import pandas as pd
import numpy as np

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

os.environ['MPLCONFIGDIR'] = os.path.abspath('results/mpl_cache')

def train_and_evaluate():
    data_path = "data/road_accident_model_cleaned.csv"
    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Target definition
    target_col = 'accident_severity'
    target_classes = ['Minor', 'Moderate', 'Severe', 'Fatal']
    target_map = {name: idx for idx, name in enumerate(target_classes)}
    inv_target_map = {idx: name for idx, name in enumerate(target_classes)}
    
    y = df[target_col].map(target_map).values
    X = df.drop(columns=[target_col])
    
    categorical_features = ['city', 'state', 'day_of_week', 'road_type', 'weather', 'visibility', 'traffic_density', 'festival']
    numerical_features = ['month', 'hour', 'lanes', 'traffic_signal', 'temperature']
    
    print(f"Dataset Features ({len(X.columns)}): {list(X.columns)}")
    print(f"Target Classes: {target_classes}")
    
    # 80:20 Stratified Split
    print("Performing 80:20 stratified train-test split (random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )
    print(f"Training samples: {len(X_train):,}, Test samples: {len(X_test):,}")
    
    # Build Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', SimpleImputer(strategy='median'), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=True), categorical_features)
        ],
        remainder='drop'
    )
    
    models = {
        "Decision Tree": DecisionTreeClassifier(
            max_depth=12,
            min_samples_split=25,
            min_samples_leaf=15,
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=50,
            max_depth=12,
            min_samples_split=25,
            min_samples_leaf=15,
            n_jobs=-1,
            random_state=42
        ),
        "XGBoost": XGBClassifier(
            n_estimators=60,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            objective='multi:softprob',
            eval_metric='mlogloss',
            n_jobs=-1,
            random_state=42
        )
    }
    
    results = {}
    fitted_pipelines = {}
    
    for name, clf in models.items():
        print(f"\n==================================================")
        print(f"Training {name}...")
        start_time = time.time()
        
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])
        
        pipeline.fit(X_train, y_train)
        train_time = round(time.time() - start_time, 2)
        print(f"{name} trained in {train_time} seconds.")
        
        # Predictions
        print(f"Evaluating {name} on Train and Test sets...")
        y_train_pred = pipeline.predict(X_train)
        y_test_pred = pipeline.predict(X_test)
        
        # Metrics
        train_acc = float(accuracy_score(y_train, y_train_pred))
        test_acc = float(accuracy_score(y_test, y_test_pred))
        
        macro_prec = float(precision_score(y_test, y_test_pred, average='macro', zero_division=0))
        macro_rec = float(recall_score(y_test, y_test_pred, average='macro', zero_division=0))
        macro_f1 = float(f1_score(y_test, y_test_pred, average='macro', zero_division=0))
        weighted_f1 = float(f1_score(y_test, y_test_pred, average='weighted', zero_division=0))
        
        train_f1 = float(f1_score(y_train, y_train_pred, average='macro', zero_division=0))
        
        cm = confusion_matrix(y_test, y_test_pred).tolist()
        cr = classification_report(y_test, y_test_pred, target_names=target_classes, output_dict=True, zero_division=0)
        
        results[name] = {
            "training_time_seconds": train_time,
            "train_accuracy": round(train_acc, 4),
            "test_accuracy": round(test_acc, 4),
            "train_macro_f1": round(train_f1, 4),
            "macro_precision": round(macro_prec, 4),
            "macro_recall": round(macro_rec, 4),
            "macro_f1": round(macro_f1, 4),
            "weighted_f1": round(weighted_f1, 4),
            "overfitting_gap": round(train_acc - test_acc, 4),
            "confusion_matrix": cm,
            "classification_report": cr
        }
        
        fitted_pipelines[name] = pipeline
        
        print(f"{name} Results:")
        print(f"  Test Accuracy:     {test_acc*100:.2f}% (Train: {train_acc*100:.2f}%)")
        print(f"  Macro F1-Score:    {macro_f1*100:.2f}% (Train: {train_f1*100:.2f}%)")
        print(f"  Macro Precision:   {macro_prec*100:.2f}%")
        print(f"  Macro Recall:      {macro_rec*100:.2f}%")
        print(f"  Weighted F1-Score: {weighted_f1*100:.2f}%")
        print(f"  Overfitting Gap:   {(train_acc - test_acc)*100:.2f}%")
        
    # Select best model based on test Macro F1-score
    best_model_name = max(results, key=lambda k: results[k]['macro_f1'])
    print(f"\n>>> Best Performing Model: {best_model_name} (Macro F1: {results[best_model_name]['macro_f1']*100:.2f}%)")
    best_pipeline = fitted_pipelines[best_model_name]
    
    # Save Model Artifacts
    print(f"\nExporting complete pipeline as 'accident_severity_model.pkl'...")
    model_filename = "accident_severity_model.pkl"
    joblib.dump(best_pipeline, model_filename, compress=3)
    file_size_mb = os.path.getsize(model_filename) / (1024 * 1024)
    print(f"Model saved successfully. File size: {file_size_mb:.2f} MB")
    
    # Feature Importance Visualization
    print("\nExtracting Feature Importances...")
    clf_obj = best_pipeline.named_steps['classifier']
    prep_obj = best_pipeline.named_steps['preprocessor']
    
    # Get feature names from OneHotEncoder and numericals
    cat_feature_names = prep_obj.named_transformers_['cat'].get_feature_names_out(categorical_features).tolist()
    all_feature_names = numerical_features + cat_feature_names
    
    if hasattr(clf_obj, 'feature_importances_'):
        importances = clf_obj.feature_importances_
        importance_df = pd.DataFrame({
            'feature': all_feature_names,
            'importance': importances
        }).sort_values(by='importance', ascending=False)
        
        top15_features = importance_df.head(15)
        
        plt.figure(figsize=(10, 6))
        sns.barplot(data=top15_features, x='importance', y='feature', color='#3B82F6')
        plt.title(f"Top 15 Feature Importances ({best_model_name})", fontsize=14, fontweight='bold', pad=12)
        plt.xlabel("Gini / Gain Importance", fontsize=12)
        plt.ylabel("Engineered Feature", fontsize=12)
        plt.tight_layout()
        plt.savefig("eda_plots/feature_importance.png", dpi=200)
        plt.close()
        
        top_features_list = top15_features.to_dict(orient='records')
    else:
        top_features_list = []
        
    # Model Comparison Visualizations
    print("Generating Evaluation Comparison Visualizations...")
    
    # 1. Accuracy & Macro F1 Bar Chart
    plt.figure(figsize=(9, 5))
    metrics_summary_df = pd.DataFrame([
        {"Model": m, "Metric": "Test Accuracy", "Score": results[m]["test_accuracy"] * 100}
        for m in models
    ] + [
        {"Model": m, "Metric": "Macro F1-Score", "Score": results[m]["macro_f1"] * 100}
        for m in models
    ])
    
    ax = sns.barplot(data=metrics_summary_df, x="Model", y="Score", hue="Metric", palette=["#2563EB", "#10B981"])
    plt.title("Model Performance Comparison on Test Set (N=100,000)", fontsize=14, fontweight='bold', pad=12)
    plt.ylabel("Score (%)", fontsize=12)
    plt.ylim(0, 100)
    for p in ax.patches:
        height = p.get_height()
        if height > 0:
            ax.annotate(f"{height:.2f}%",
                        (p.get_x() + p.get_width() / 2., height + 1.5),
                        ha='center', va='bottom', fontsize=10, fontweight='bold')
    plt.tight_layout()
    plt.savefig("eda_plots/model_comparison_metrics.png", dpi=200)
    plt.close()
    
    # 2. Confusion Matrices
    for name in models:
        cm_data = np.array(results[name]['confusion_matrix'])
        plt.figure(figsize=(7, 6))
        sns.heatmap(cm_data, annot=True, fmt=',d', cmap='Blues',
                    xticklabels=target_classes, yticklabels=target_classes, cbar=False)
        plt.title(f"Confusion Matrix - {name}", fontsize=13, fontweight='bold', pad=12)
        plt.xlabel("Predicted Severity Level", fontsize=11)
        plt.ylabel("True Severity Level", fontsize=11)
        plt.tight_layout()
        safe_name = name.lower().replace(' ', '_')
        plt.savefig(f"eda_plots/confusion_matrix_{safe_name}.png", dpi=200)
        plt.close()
        
    # Save Comprehensive Metadata
    metadata = {
        "project_title": "Road Accident Severity Prediction Using Machine Learning Algorithms",
        "model_version": "1.0.0",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "best_model_name": best_model_name,
        "model_file": model_filename,
        "model_file_size_mb": round(file_size_mb, 2),
        "target_column": target_col,
        "target_classes": target_classes,
        "target_mapping": target_map,
        "input_features": list(X.columns),
        "categorical_features": categorical_features,
        "numerical_features": numerical_features,
        "total_dataset_rows": len(df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "evaluation_summary": results,
        "top_features": top_features_list
    }
    
    with open("results/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
        
    print("\nTraining, Evaluation, and Artifact Export Completed Successfully!")
    print("Metadata written to 'results/model_metadata.json'")

if __name__ == "__main__":
    train_and_evaluate()

