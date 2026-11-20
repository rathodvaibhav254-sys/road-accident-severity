import subprocess
import time
import requests
import json
import sys

def test_server():
    print("Starting Next.js production server for validation...")
    proc = subprocess.Popen(["npm", "run", "start"], shell=True)
    time.sleep(5)
    
    sample_payload = {
        "city": "Mumbai",
        "state": "Maharashtra",
        "month": 7,
        "hour": 19,
        "day_of_week": "Friday",
        "road_type": "National Highway",
        "lanes": 4,
        "traffic_signal": 1,
        "weather": "Rainy",
        "visibility": "Low",
        "temperature": 28.5,
        "traffic_density": "High",
        "festival": "Unknown"
    }
    
    try:
        print("Sending POST request to http://localhost:3000/api/predict...")
        res = requests.post("http://localhost:3000/api/predict", json=sample_payload, timeout=30)
        print(f"Status Code: {res.status_code}")
        print("Response Payload:")
        print(json.dumps(res.json(), indent=2))
        assert res.status_code == 200
        assert res.json().get("status") == "success"
        print("\nAPI END-TO-END VERIFICATION: PASSED!")
    finally:
        print("Terminating test server...")
        subprocess.run(f"taskkill /F /T /PID {proc.pid}", shell=True, capture_output=True)

if __name__ == "__main__":
    test_server()

