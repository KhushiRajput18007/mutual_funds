import requests
import json
import concurrent.futures
from datetime import datetime
import sys

SAMPLE_SCHEMES = [
    '120503', '118989', '120716', '119226', '100016', '100032', '100048', '100064',
    '100080', '100096', '100112', '100128', '100144', '100160', '100176', '100192',
    '100208', '100224', '100240', '100256', '100272', '100288', '100304', '100320'
]

def fetch_scheme_data(scheme_code):
    try:
        url = f'https://api.mfapi.in/mf/{scheme_code}'
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return None
        
        data = response.json()
        if not data.get('data') or len(data['data']) < 100:
            return None

        nav_data = data['data']
        latest = float(nav_data[0]['nav'])
        
        returns_1y = 0
        returns_3y = 0
        
        if len(nav_data) > 250:
            nav_1y_ago = float(nav_data[250]['nav'])
            returns_1y = round(((latest - nav_1y_ago) / nav_1y_ago * 100), 2)
        
        if len(nav_data) > 750:
            nav_3y_ago = float(nav_data[750]['nav'])
            returns_3y = round(((latest - nav_3y_ago) / nav_3y_ago * 100), 2)
        
        start_date = datetime.strptime(nav_data[-1]['date'], '%d-%m-%Y')
        age = (datetime.now() - start_date).days // 365
        
        return {
            'schemeCode': scheme_code,
            'schemeName': data['meta'].get('scheme_name', 'Unknown'),
            'returns1Y': returns_1y,
            'returns3Y': returns_3y,
            'age': age,
            'latestNAV': latest,
            'category': data['meta'].get('scheme_category', 'Unknown'),
            'fundHouse': data['meta'].get('fund_house', 'Unknown')
        }
    except:
        return None

def get_peer_comparison(filter_type='all'):
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(fetch_scheme_data, SAMPLE_SCHEMES))
    
    valid_schemes = [scheme for scheme in results if scheme is not None]
    
    filtered_schemes = []
    for scheme in valid_schemes:
        if filter_type == 'high-returns' and scheme['returns1Y'] > 8:
            filtered_schemes.append(scheme)
        elif filter_type == '3-years' and 3 <= scheme['age'] <= 5:
            filtered_schemes.append(scheme)
        elif filter_type == '10-years' and scheme['age'] >= 10:
            filtered_schemes.append(scheme)
        elif filter_type == 'top-performers' and scheme['returns1Y'] > 15:
            filtered_schemes.append(scheme)
        elif filter_type == 'all':
            filtered_schemes.append(scheme)
    
    filtered_schemes.sort(key=lambda x: x['returns1Y'], reverse=True)
    
    return {
        'filter': filter_type,
        'count': len(filtered_schemes),
        'schemes': filtered_schemes[:25]
    }

if __name__ == '__main__':
    filter_type = sys.argv[1] if len(sys.argv) > 1 else 'all'
    result = get_peer_comparison(filter_type)
    print(json.dumps(result))