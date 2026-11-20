import os
import json
from http.server import BaseHTTPRequestHandler
import joblib
import pandas as pd
import numpy as np

# Global cached model
_MODEL = None
_TARGET_CLASSES = ['Minor', 'Moderate', 'Severe', 'Fatal']

def get_model():
    global _MODEL
    if _MODEL is None:
        possible_paths = [
            "accident_severity_model.pkl",
            os.path.join(os.path.dirname(__file__), "accident_severity_model.pkl"),
            os.path.join(os.path.dirname(__file__), "..", "accident_severity_model.pkl"),
            "/var/task/accident_severity_model.pkl"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                _MODEL = joblib.load(path)
                break
        if _MODEL is None:
            raise FileNotFoundError("Could not find accident_severity_model.pkl in search paths.")
    return _MODEL

REQUIRED_FIELDS = [
    'city', 'state', 'month', 'hour', 'day_of_week', 'road_type',
    'lanes', 'traffic_signal', 'weather', 'visibility', 'temperature',
    'traffic_density', 'festival'
]

class handler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        self._set_headers(200)
        resp = {
            "status": "healthy",
            "service": "RoadSense India - Accident Severity Prediction API",
            "model": "XGBoost Multiclass Pipeline",
            "version": "1.0.0",
            "required_fields": REQUIRED_FIELDS,
            "classes": _TARGET_CLASSES
        }
        self.wfile.write(json.dumps(resp).encode('utf-8'))

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._set_headers(400)
                self.wfile.write(json.dumps({"status": "error", "message": "Empty request body."}).encode('utf-8'))
                return

            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)

            # Validation
            missing = [f for f in REQUIRED_FIELDS if f not in data or data[f] is None or data[f] == ""]
            if missing:
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    "status": "error",
                    "message": f"Missing required fields: {', '.join(missing)}"
                }).encode('utf-8'))
                return

            # Sanitize types
            record = {
                'city': str(data['city']).strip(),
                'state': str(data['state']).strip(),
                'month': int(data['month']),
                'hour': int(data['hour']),
                'day_of_week': str(data['day_of_week']).strip(),
                'road_type': str(data['road_type']).strip(),
                'lanes': int(data['lanes']),
                'traffic_signal': int(data['traffic_signal']),
                'weather': str(data['weather']).strip(),
                'visibility': str(data['visibility']).strip(),
                'temperature': float(data['temperature']),
                'traffic_density': str(data['traffic_density']).strip(),
                'festival': str(data['festival']).strip()
            }

            input_df = pd.DataFrame([record])
            model = get_model()

            pred_idx = int(model.predict(input_df)[0])
            predicted_class = _TARGET_CLASSES[pred_idx]

            probabilities = {}
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(input_df)[0]
                for idx, cname in enumerate(_TARGET_CLASSES):
                    probabilities[cname] = round(float(probs[idx]), 4)
                confidence = probabilities[predicted_class]
            else:
                confidence = 1.0

            response_payload = {
                "status": "success",
                "prediction": predicted_class,
                "severity_index": pred_idx,
                "confidence_score": confidence,
                "class_probabilities": probabilities,
                "model_name": "XGBoost Classifier (Multiclass)",
                "model_version": "1.0.0",
                "inputs_received": record,
                "disclaimer": "Academic ML Demonstration. Not intended for operational emergency deployment."
            }

            self._set_headers(200)
            self.wfile.write(json.dumps(response_payload).encode('utf-8'))

        except Exception as e:
            self._set_headers(500)
            err_resp = {
                "status": "error",
                "message": "Internal prediction error.",
                "details": str(e)
            }
            self.wfile.write(json.dumps(err_resp).encode('utf-8'))

if __name__ == "__main__":
    from http.server import HTTPServer
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, handler)
    print("Serving prediction API on port 8000...")
    httpd.serve_forever()

