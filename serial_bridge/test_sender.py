import os
import time
import requests
from dotenv import load_dotenv
from colorama import init, Fore, Style

init(autoreset=True)
load_dotenv()

API_URL = "http://localhost:8000/api/alert"
API_KEY = os.getenv("API_KEY", "test_key_123")

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

sample_alerts = [
    {"deviceId": "DEV001", "helpType": "SOS", "lat": 17.385044, "lng": 78.486671},
    {"deviceId": "DEV002", "helpType": "Medical", "lat": 17.405044, "lng": 78.506671},
    {"deviceId": "DEV003", "helpType": "Water", "lat": 17.365044, "lng": 78.466671},
    {"deviceId": "DEV004", "helpType": "Food", "lat": 17.425044, "lng": 78.446671},
    {"deviceId": "DEV005", "helpType": "SOS", "lat": 17.445044, "lng": 78.426671}
]

print(f"{Fore.CYAN}{Style.BRIGHT}=========================================")
print(f"{Fore.CYAN}{Style.BRIGHT}  RakshakNet API Test Sender")
print(f"{Fore.CYAN}{Style.BRIGHT}=========================================")

for i, alert in enumerate(sample_alerts, 1):
    print(f"\n{Fore.YELLOW}Sending Alert {i}/{len(sample_alerts)}: {alert['helpType']} from {alert['deviceId']}")
    try:
        response = requests.post(API_URL, json=alert, headers=headers, timeout=5)
        if response.status_code in (200, 201):
            print(f"{Fore.GREEN}[SUCCESS] Status: {response.status_code}, Response: {response.text}")
        else:
            print(f"{Fore.RED}[ERROR] Status: {response.status_code}, Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"{Fore.RED}[NETWORK ERROR] {e}")
    time.sleep(1)

print(f"\n{Fore.CYAN}Finished sending test alerts.")
