import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Call python script to run inference on the trained accident_severity_model.pkl
    const pythonCode = `
import sys, json, os, joblib, pandas as pd

try:
    payload = json.loads(sys.stdin.read())
    model_paths = [
        "accident_severity_model.pkl",
        "api/accident_severity_model.pkl",
        os.path.join(os.getcwd(), "accident_severity_model.pkl")
    ]
    model = None
    for p in model_paths:
        if os.path.exists(p):
            model = joblib.load(p)
            break
            
    if model is None:
        print(json.dumps({"status": "error", "message": "Model file accident_severity_model.pkl not found"}))
        sys.exit(1)
        
    target_classes = ['Minor', 'Moderate', 'Severe', 'Fatal']
    record = {
        'city': str(payload.get('city', '')),
        'state': str(payload.get('state', '')),
        'month': int(payload.get('month', 1)),
        'hour': int(payload.get('hour', 12)),
        'day_of_week': str(payload.get('day_of_week', 'Monday')),
        'road_type': str(payload.get('road_type', 'National Highway')),
        'lanes': int(payload.get('lanes', 4)),
        'traffic_signal': int(payload.get('traffic_signal', 1)),
        'weather': str(payload.get('weather', 'Clear')),
        'visibility': str(payload.get('visibility', 'Medium')),
        'temperature': float(payload.get('temperature', 25.0)),
        'traffic_density': str(payload.get('traffic_density', 'Medium')),
        'festival': str(payload.get('festival', 'Unknown'))
    }
    
    df = pd.DataFrame([record])
    pred_idx = int(model.predict(df)[0])
    pred_class = target_classes[pred_idx]
    
    probabilities = {}
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(df)[0]
        for idx, cname in enumerate(target_classes):
            probabilities[cname] = round(float(probs[idx]), 4)
        confidence = probabilities[pred_class]
    else:
        confidence = 1.0
        
    print(json.dumps({
        "status": "success",
        "prediction": pred_class,
        "severity_index": pred_idx,
        "confidence_score": confidence,
        "class_probabilities": probabilities,
        "model_name": "XGBoost Classifier (Multiclass Pipeline)",
        "model_version": "1.0.0",
        "inputs_received": record,
        "disclaimer": "Academic ML Demonstration. Model trained on 500k Indian road accident records."
    }))
except Exception as e:
    print(json.dumps({"status": "error", "message": str(e)}))
`;

    const pythonProcess = spawn('python', ['-c', pythonCode]);
    
    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdin.write(JSON.stringify(body));
    pythonProcess.stdin.end();

    const outputPromise = new Promise((resolve, reject) => {
      pythonProcess.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });
      pythonProcess.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });
      pythonProcess.on('close', (code) => {
        if (code !== 0 && !stdoutData) {
          reject(new Error(stderrData || `Python exited with code ${code}`));
        } else {
          resolve(stdoutData);
        }
      });
    });

    const result = await outputPromise;
    const parsed = JSON.parse(result);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Prediction API Error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal server error during prediction' },
      { status: 500 }
    );
  }
}

