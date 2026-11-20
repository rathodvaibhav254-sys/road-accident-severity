import os
import json
import hashlib
import pandas as pd
import numpy as np

# Coordinates for all 28 Indian states (latitude, longitude, zoom)
STATE_COORDINATES = {
    'Andhra Pradesh': {'lat': 15.9129, 'lng': 79.7400, 'min_lat': 12.6, 'max_lat': 19.1, 'min_lng': 76.7, 'max_lng': 84.7},
    'Arunachal Pradesh': {'lat': 28.2180, 'lng': 94.7278, 'min_lat': 26.6, 'max_lat': 29.5, 'min_lng': 91.5, 'max_lng': 97.4},
    'Assam': {'lat': 26.2006, 'lng': 92.9376, 'min_lat': 24.1, 'max_lat': 27.9, 'min_lng': 89.7, 'max_lng': 96.0},
    'Bihar': {'lat': 25.0961, 'lng': 85.3131, 'min_lat': 24.3, 'max_lat': 27.5, 'min_lng': 83.3, 'max_lng': 88.3},
    'Chhattisgarh': {'lat': 21.2787, 'lng': 81.8661, 'min_lat': 17.8, 'max_lat': 24.1, 'min_lng': 80.2, 'max_lng': 84.4},
    'Goa': {'lat': 15.2993, 'lng': 74.1240, 'min_lat': 14.9, 'max_lat': 15.8, 'min_lng': 73.7, 'max_lng': 74.3},
    'Gujarat': {'lat': 22.2587, 'lng': 71.1924, 'min_lat': 20.1, 'max_lat': 24.7, 'min_lng': 68.2, 'max_lng': 74.5},
    'Haryana': {'lat': 29.0588, 'lng': 76.0856, 'min_lat': 27.6, 'max_lat': 30.9, 'min_lng': 74.4, 'max_lng': 77.6},
    'Himachal Pradesh': {'lat': 31.1048, 'lng': 77.1734, 'min_lat': 30.4, 'max_lat': 33.2, 'min_lng': 75.6, 'max_lng': 79.0},
    'Jharkhand': {'lat': 23.6102, 'lng': 85.2799, 'min_lat': 22.0, 'max_lat': 25.3, 'min_lng': 83.3, 'max_lng': 87.9},
    'Karnataka': {'lat': 15.3173, 'lng': 75.7139, 'min_lat': 11.6, 'max_lat': 18.5, 'min_lng': 74.0, 'max_lng': 78.6},
    'Kerala': {'lat': 10.8505, 'lng': 76.2711, 'min_lat': 8.3, 'max_lat': 12.8, 'min_lng': 74.9, 'max_lng': 77.4},
    'Madhya Pradesh': {'lat': 22.9734, 'lng': 78.6569, 'min_lat': 21.1, 'max_lat': 26.9, 'min_lng': 74.0, 'max_lng': 82.8},
    'Maharashtra': {'lat': 19.7515, 'lng': 75.7139, 'min_lat': 15.6, 'max_lat': 22.0, 'min_lng': 72.6, 'max_lng': 80.9},
    'Manipur': {'lat': 24.6637, 'lng': 93.9063, 'min_lat': 23.8, 'max_lat': 25.7, 'min_lng': 93.0, 'max_lng': 94.8},
    'Meghalaya': {'lat': 25.4670, 'lng': 91.3662, 'min_lat': 25.0, 'max_lat': 26.1, 'min_lng': 89.8, 'max_lng': 92.8},
    'Mizoram': {'lat': 23.1645, 'lng': 92.9376, 'min_lat': 21.9, 'max_lat': 24.5, 'min_lng': 92.2, 'max_lng': 93.4},
    'Nagaland': {'lat': 26.1584, 'lng': 94.5624, 'min_lat': 25.2, 'max_lat': 27.0, 'min_lng': 93.3, 'max_lng': 95.2},
    'Odisha': {'lat': 20.9517, 'lng': 85.0985, 'min_lat': 17.8, 'max_lat': 22.6, 'min_lng': 81.4, 'max_lng': 87.5},
    'Punjab': {'lat': 31.1471, 'lng': 75.3412, 'min_lat': 29.5, 'max_lat': 32.5, 'min_lng': 73.9, 'max_lng': 76.9},
    'Rajasthan': {'lat': 27.0238, 'lng': 74.2179, 'min_lat': 23.0, 'max_lat': 30.2, 'min_lng': 69.5, 'max_lng': 78.3},
    'Sikkim': {'lat': 27.5330, 'lng': 88.5122, 'min_lat': 27.1, 'max_lat': 28.1, 'min_lng': 88.0, 'max_lng': 88.9},
    'Tamil Nadu': {'lat': 11.1271, 'lng': 78.6569, 'min_lat': 8.1, 'max_lat': 13.5, 'min_lng': 76.2, 'max_lng': 80.3},
    'Telangana': {'lat': 18.1124, 'lng': 79.0193, 'min_lat': 15.8, 'max_lat': 19.9, 'min_lng': 77.2, 'max_lng': 81.3},
    'Tripura': {'lat': 23.9408, 'lng': 91.9882, 'min_lat': 22.9, 'max_lat': 24.5, 'min_lng': 91.1, 'max_lng': 92.3},
    'Uttar Pradesh': {'lat': 26.8467, 'lng': 80.9462, 'min_lat': 23.9, 'max_lat': 30.4, 'min_lng': 77.1, 'max_lng': 84.6},
    'Uttarakhand': {'lat': 30.0668, 'lng': 79.0193, 'min_lat': 28.7, 'max_lat': 31.5, 'min_lng': 77.6, 'max_lng': 81.0},
    'West Bengal': {'lat': 22.9868, 'lng': 87.8550, 'min_lat': 21.5, 'max_lat': 27.2, 'min_lng': 85.8, 'max_lng': 89.9}
}

# Major known Indian city coordinates
MAJOR_CITY_COORDINATES = {
    'Mumbai': (19.0760, 72.8777), 'Pune': (18.5204, 73.8567), 'Nagpur': (21.1458, 79.0882),
    'Nashik': (19.9975, 73.7898), 'Aurangabad': (19.8762, 75.3433), 'Thane': (19.2183, 72.9781),
    'Delhi': (28.7041, 77.1025), 'New Delhi': (28.6139, 77.2090),
    'Bangalore': (12.9716, 77.5946), 'Mysore': (12.2958, 76.6394), 'Mangalore': (12.9141, 74.8560),
    'Hubli': (15.3647, 75.1240), 'Belgaum': (15.8497, 74.4977),
    'Hyderabad': (17.3850, 78.4867), 'Warangal': (17.9689, 79.5941), 'Nizamabad': (18.6725, 78.0941),
    'Chennai': (13.0827, 80.2707), 'Coimbatore': (11.0168, 76.9558), 'Madurai': (9.9252, 78.1198),
    'Salem': (11.6643, 78.1460), 'Tiruchirappalli': (10.7905, 78.7047),
    'Kolkata': (22.5726, 88.3639), 'Howrah': (22.5958, 88.2636), 'Durgapur': (23.5204, 87.3119),
    'Asansol': (23.6739, 86.9524), 'Siliguri': (26.7271, 88.3953),
    'Ahmedabad': (23.0225, 72.5714), 'Surat': (21.1702, 72.8311), 'Vadodara': (22.3072, 73.1812),
    'Rajkot': (22.3039, 70.8022), 'Bhavnagar': (21.7645, 72.1519), 'Jamnagar': (22.4707, 70.0577),
    'Jaipur': (26.9124, 75.7873), 'Jodhpur': (26.2389, 73.0243), 'Udaipur': (24.5854, 73.7125),
    'Kota': (25.2138, 75.8648), 'Bikaner': (28.0229, 73.3119), 'Ajmer': (26.4499, 74.6399),
    'Lucknow': (26.8467, 80.9462), 'Kanpur': (26.4499, 80.3319), 'Varanasi': (25.3176, 82.9739),
    'Agra': (27.1767, 78.0081), 'Prayagraj': (25.4358, 81.8463), 'Meerut': (28.9845, 77.7064),
    'Ghaziabad': (28.6692, 77.4538), 'Noida': (28.5355, 77.3910), 'Bareilly': (28.3670, 79.4304),
    'Bhopal': (23.2599, 77.4126), 'Indore': (22.7196, 75.8577), 'Gwalior': (26.2183, 78.1828),
    'Jabalpur': (23.1815, 79.9864), 'Ujjain': (23.1765, 75.7885),
    'Patna': (25.5941, 85.1376), 'Gaya': (24.7914, 85.0002), 'Bhagalpur': (25.2425, 86.9842),
    'Muzaffarpur': (26.1209, 85.3647),
    'Chandigarh': (30.7333, 76.7794), 'Ludhiana': (30.9010, 75.8573), 'Amritsar': (31.6340, 74.8723),
    'Jalandhar': (31.3260, 75.5762), 'Patiala': (30.3398, 76.3869),
    'Gurugram': (28.4595, 77.0266), 'Faridabad': (28.4089, 77.3178), 'Panipat': (29.3909, 76.9635),
    'Bhubaneswar': (20.2961, 85.8245), 'Cuttack': (20.4625, 85.8828), 'Rourkela': (22.2604, 84.8536),
    'Guwahati': (26.1445, 91.7362), 'Silchar': (24.8333, 92.7789), 'Dibrugarh': (27.4728, 94.9120),
    'Ranchi': (23.3441, 85.3096), 'Jamshedpur': (22.8046, 86.2029), 'Dhanbad': (23.7957, 86.4304),
    'Raipur': (21.2514, 81.6296), 'Bhilai': (21.2167, 81.4333), 'Bilaspur': (22.0797, 82.1409),
    'Dehradun': (30.3165, 78.0322), 'Haridwar': (29.9457, 78.1642), 'Rishikesh': (30.0869, 78.2676),
    'Thiruvananthapuram': (8.5241, 76.9366), 'Kochi': (9.9312, 76.2673), 'Kozhikode': (11.2588, 75.7804),
    'Panaji': (15.4909, 73.8278), 'Margao': (15.2832, 73.9862),
    'Shimla': (31.1048, 77.1734), 'Dharamshala': (32.2190, 76.3234),
    'Visakhapatnam': (17.6868, 83.2185), 'Vijayawada': (16.5062, 80.6480), 'Guntur': (16.3067, 80.4365),
    'Imphal': (24.8170, 93.9368), 'Shillong': (25.5788, 91.8933), 'Aizawl': (23.7307, 92.7173),
    'Kohima': (25.6751, 94.1086), 'Gangtok': (27.3314, 88.6138), 'Agartala': (23.8315, 91.2868),
    'Itanagar': (27.0844, 93.6053)
}

def get_city_coords(city_name, state_name):
    if city_name in MAJOR_CITY_COORDINATES:
        return MAJOR_CITY_COORDINATES[city_name]
    
    # Deterministic coordinate offset within the state bounding box
    state_box = STATE_COORDINATES.get(state_name, {'lat': 22.0, 'lng': 78.0, 'min_lat': 20.0, 'max_lat': 24.0, 'min_lng': 76.0, 'max_lng': 80.0})
    hash_val = int(hashlib.md5(f"{city_name}_{state_name}".encode()).hexdigest()[:8], 16)
    
    lat_range = state_box['max_lat'] - state_box['min_lat']
    lng_range = state_box['max_lng'] - state_box['min_lng']
    
    norm_x = ((hash_val % 1000) / 1000.0) * 0.8 + 0.1  # stay away from extreme edges
    norm_y = (((hash_val // 1000) % 1000) / 1000.0) * 0.8 + 0.1
    
    lat = round(state_box['min_lat'] + norm_x * lat_range, 4)
    lng = round(state_box['min_lng'] + norm_y * lng_range, 4)
    return (lat, lng)

def main():
    print("Loading dataset for frontend optimization...")
    df = pd.read_csv("data/road_accident_model_cleaned.csv")
    
    os.makedirs("public/data", exist_ok=True)
    
    severity_order = ['Minor', 'Moderate', 'Severe', 'Fatal']
    
    # 1. State-City Mapping
    print("Building State-City Mapping...")
    state_city_map = {}
    for state, group in df.groupby('state'):
        state_city_map[state] = sorted(group['city'].unique().tolist())
        
    with open("public/data/state_city_mapping.json", "w") as f:
        json.dump(state_city_map, f, indent=2)
        
    # 2. City Aggregations for Interactive Map
    print("Aggregating City Data with Geographic Centroids...")
    city_aggregates = []
    
    city_groups = df.groupby(['state', 'city'])
    for (state, city), grp in city_groups:
        total = len(grp)
        sev_counts = grp['accident_severity'].value_counts().to_dict()
        lat, lng = get_city_coords(city, state)
        
        dominant_sev = grp['accident_severity'].mode()[0] if not grp.empty else "Moderate"
        top_weather = grp['weather'].mode()[0] if not grp.empty else "Sunny"
        top_road = grp['road_type'].mode()[0] if not grp.empty else "City Road"
        
        city_aggregates.append({
            'city': city,
            'state': state,
            'lat': lat,
            'lng': lng,
            'total_accidents': total,
            'severities': {
                'Minor': int(sev_counts.get('Minor', 0)),
                'Moderate': int(sev_counts.get('Moderate', 0)),
                'Severe': int(sev_counts.get('Severe', 0)),
                'Fatal': int(sev_counts.get('Fatal', 0))
            },
            'dominant_severity': dominant_sev,
            'top_weather': top_weather,
            'top_road_type': top_road
        })
        
    # Sort cities by total accidents descending
    city_aggregates.sort(key=lambda x: x['total_accidents'], reverse=True)
    with open("public/data/city_aggregations.json", "w") as f:
        json.dump(city_aggregates, f, indent=2)
        
    # 3. State Aggregations
    print("Aggregating State Data...")
    state_aggregates = []
    for state, grp in df.groupby('state'):
        total = len(grp)
        sev_counts = grp['accident_severity'].value_counts().to_dict()
        coords = STATE_COORDINATES.get(state, {'lat': 20.0, 'lng': 78.0})
        
        weather_counts = grp['weather'].value_counts().to_dict()
        road_counts = grp['road_type'].value_counts().to_dict()
        density_counts = grp['traffic_density'].value_counts().to_dict()
        
        state_aggregates.append({
            'state': state,
            'lat': coords['lat'],
            'lng': coords['lng'],
            'total_accidents': total,
            'severities': {
                'Minor': int(sev_counts.get('Minor', 0)),
                'Moderate': int(sev_counts.get('Moderate', 0)),
                'Severe': int(sev_counts.get('Severe', 0)),
                'Fatal': int(sev_counts.get('Fatal', 0))
            },
            'weather_breakdown': weather_counts,
            'road_breakdown': road_counts,
            'density_breakdown': density_counts,
            'city_count': len(grp['city'].unique())
        })
        
    state_aggregates.sort(key=lambda x: x['total_accidents'], reverse=True)
    with open("public/data/state_aggregations.json", "w") as f:
        json.dump(state_aggregates, f, indent=2)
        
    # 4. Global Analytics and Pre-Aggregated Crosstabs
    print("Generating Dashboard Analytics Pre-aggregations...")
    
    analytics = {
        'total_accidents': len(df),
        'severity_summary': {
            'Minor': int(df['accident_severity'].value_counts().get('Minor', 0)),
            'Moderate': int(df['accident_severity'].value_counts().get('Moderate', 0)),
            'Severe': int(df['accident_severity'].value_counts().get('Severe', 0)),
            'Fatal': int(df['accident_severity'].value_counts().get('Fatal', 0))
        },
        'state_counts': df['state'].value_counts().to_dict(),
        'top_cities': df['city'].value_counts().head(15).to_dict(),
        'month_distribution': df['month'].value_counts().sort_index().to_dict(),
        'hour_distribution': df['hour'].value_counts().sort_index().to_dict(),
        'day_distribution': df['day_of_week'].value_counts().reindex(
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        ).to_dict(),
        'weather_vs_severity': pd.crosstab(df['weather'], df['accident_severity']).to_dict(orient='index'),
        'road_vs_severity': pd.crosstab(df['road_type'], df['accident_severity']).to_dict(orient='index'),
        'density_vs_severity': pd.crosstab(df['traffic_density'], df['accident_severity']).to_dict(orient='index'),
        'visibility_vs_severity': pd.crosstab(df['visibility'], df['accident_severity']).to_dict(orient='index'),
        'lanes_summary': df['lanes'].value_counts().to_dict(),
        'signals_summary': df['traffic_signal'].value_counts().to_dict(),
        'temp_stats': {
            'min': float(df['temperature'].min()),
            'max': float(df['temperature'].max()),
            'mean': float(round(df['temperature'].mean(), 1))
        }
    }
    with open("public/data/dashboard_analytics.json", "w") as f:
        json.dump(analytics, f, indent=2)
        
    # Copy model metadata to frontend
    if os.path.exists("results/model_metadata.json"):
        with open("results/model_metadata.json", "r") as f:
            meta = json.load(f)
        with open("public/data/model_metadata.json", "w") as f:
            json.dump(meta, f, indent=2)
            
    # 5. Dataset Preview (First 3,000 diverse records for instantaneous client search & pagination)
    print("Generating Dataset Sample (3,000 records) for Dataset Explorer...")
    sample_df = df.sample(n=3000, random_state=42).copy()
    sample_df['id'] = range(1, len(sample_df) + 1)
    sample_records = sample_df.to_dict(orient='records')
    with open("public/data/dataset_sample.json", "w") as f:
        json.dump(sample_records, f)
        
    print("Frontend data optimization complete! All JSON assets saved.")

if __name__ == "__main__":
    main()

