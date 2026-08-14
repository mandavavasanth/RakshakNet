import os
import time
import json
import argparse
import logging
from datetime import datetime
import serial
import serial.tools.list_ports
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv
from colorama import init, Fore, Style

# Initialize colorama
init(autoreset=True)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler("bridge.log"), logging.StreamHandler()]
)

load_dotenv()
API_KEY = os.getenv("API_KEY", "")

def get_session_with_retries():
    session = requests.Session()
    retry = Retry(
        total=3,
        read=3,
        connect=3,
        backoff_factor=0.3,
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def map_node_to_device(node_id):
    return f"DEV{str(node_id).zfill(3)}"

def map_status_to_help_type(status):
    status = str(status).upper()
    mapping = {
        "EMERGENCY": "SOS",
        "SOS": "SOS",
        "MEDICAL": "Medical",
        "WATER": "Water",
        "FOOD": "Food"
    }
    return mapping.get(status, "SOS")

def parse_csv_line(line):
    # Expected from Arduino Mega: "Message     : STATUS=EMERGENCY,LAT=17.3821,LON=78.5108"
    if "Message" in line and ":" in line:
        msg_part = line.split(":", 1)[1].strip()
        data = {}
        parts = msg_part.split(',')
        for part in parts:
            if '=' in part:
                k, v = part.split('=', 1)
                data[k.strip().lower()] = v.strip()
        
        if 'status' in data and 'lat' in data and 'lon' in data:
            try:
                return {
                    "node_id": "01", # Default node for now if not provided
                    "status": data['status'],
                    "lat": float(data['lat']),
                    "lng": float(data['lon'])
                }
            except ValueError:
                return None
    return None

def parse_message(line):
    try:
        # Try JSON first
        data = json.loads(line)
        if "node_id" in data and "status" in data:
            return data
    except json.JSONDecodeError:
        pass
    
    # Try CSV
    return parse_csv_line(line)

def find_arduino_port():
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if "Arduino" in port.description or "CH340" in port.description or "ttyACM" in port.device:
            return port.device
    if ports:
        return ports[0].device
    return None

def main():
    parser = argparse.ArgumentParser(description="RakshakNet Serial to API Bridge")
    parser.add_argument("--port", default="COM14", help="Serial port (default: COM14)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--api-url", default="http://localhost:8000/api/alert", help="API URL")
    args = parser.parse_args()

    print(f"{Fore.CYAN}{Style.BRIGHT}=========================================")
    print(f"{Fore.CYAN}{Style.BRIGHT}  RakshakNet LoRa Serial Bridge Started")
    print(f"{Fore.CYAN}{Style.BRIGHT}=========================================")
    print(f"{Fore.YELLOW}Target Port: {args.port}")
    print(f"{Fore.YELLOW}Baud Rate:   {args.baud}")
    print(f"{Fore.YELLOW}API URL:     {args.api_url}")
    print(f"{Fore.CYAN}{Style.BRIGHT}=========================================")

    session = get_session_with_retries()
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}

    port = args.port
    
    while True:
        try:
            try:
                ser = serial.Serial(port, args.baud, timeout=1)
                print(f"{Fore.GREEN}Connected to {port} at {args.baud} baud.")
            except serial.SerialException:
                print(f"{Fore.RED}Failed to connect to {port}. Attempting auto-detect...")
                detected_port = find_arduino_port()
                if detected_port:
                    port = detected_port
                    ser = serial.Serial(port, args.baud, timeout=1)
                    print(f"{Fore.GREEN}Auto-detected and connected to {port}.")
                else:
                    print(f"{Fore.RED}No serial ports found. Retrying in 5 seconds...")
                    time.sleep(5)
                    continue

            while True:
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    # Sanitize line to prevent UnicodeEncodeError on Windows console
                    line = line.encode('ascii', 'replace').decode('ascii')
                    if not line:
                        continue
                        
                    print(f"\n{Fore.BLUE}[RAW] {line}")
                    
                    parsed = parse_message(line)
                    if parsed:
                        print(f"{Fore.CYAN}[PARSED] {parsed}")
                        
                        device_id = map_node_to_device(parsed.get('node_id'))
                        help_type = map_status_to_help_type(parsed.get('status'))
                        lat = parsed.get('lat')
                        lng = parsed.get('lng')
                        
                        payload = {
                            "deviceId": device_id,
                            "helpType": help_type,
                            "lat": lat,
                            "lng": lng,
                            "timestamp": datetime.utcnow().isoformat() + "Z"
                        }
                        
                        try:
                            response = session.post(args.api_url, json=payload, headers=headers, timeout=5)
                            if response.status_code in (200, 201):
                                try:
                                    resp_data = response.json()
                                    alert_id = resp_data.get('id', resp_data.get('_id', 'UNKNOWN_ID'))
                                except ValueError:
                                    alert_id = 'UNKNOWN_ID'
                                print(f"{Fore.GREEN}[SUCCESS] Alert POSTed! Alert ID: {alert_id}")
                            else:
                                print(f"{Fore.RED}[API ERROR] Status: {response.status_code} - {response.text}")
                        except requests.exceptions.RequestException as e:
                            print(f"{Fore.RED}[NETWORK ERROR] Failed to post alert: {e}")
                    else:
                        print(f"{Fore.YELLOW}[WARNING] Could not parse line.")
                
                time.sleep(0.01)

        except serial.SerialException as e:
            print(f"{Fore.RED}[SERIAL ERROR] {e}. Reconnecting in 5 seconds...")
            if 'ser' in locals() and ser.is_open:
                ser.close()
            time.sleep(5)
        except KeyboardInterrupt:
            print(f"\n{Fore.YELLOW}Shutting down gracefully...")
            if 'ser' in locals() and ser.is_open:
                ser.close()
            break
        except Exception as e:
            print(f"{Fore.RED}[ERROR] {e}")
            time.sleep(5)

if __name__ == '__main__':
    main()
