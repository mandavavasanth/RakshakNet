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
    """Map raw alert type from transmitter to API help type."""
    status = str(status).upper().strip()
    mapping = {
        "EMERGENCY": "SOS",
        "SOS": "SOS",
        "MEDICAL": "Medical",
        "WATER": "Water",
        "FOOD": "Food"
    }
    return mapping.get(status, "SOS")

def estimate_accuracy(rssi, snr):
    """
    Estimate GPS accuracy in meters based on LoRa signal quality.
    Better signal = higher confidence in location data integrity.
    
    RSSI ranges: -30 (excellent) to -120 (very weak)
    SNR ranges:  -20 (bad) to +15 (excellent)
    
    Returns estimated accuracy in meters.
    """
    # RSSI component: map -30..-120 to 1..20 meters
    rssi_clamped = max(-120, min(-30, rssi))
    rssi_accuracy = 1.0 + ((-30 - rssi_clamped) / (-30 - (-120))) * 19.0

    # SNR component: map +15..-20 to 1..15 meters
    snr_clamped = max(-20, min(15, snr))
    snr_accuracy = 1.0 + ((15 - snr_clamped) / (15 - (-20))) * 14.0

    # Weighted average (RSSI has more weight for distance estimation)
    accuracy = (rssi_accuracy * 0.6) + (snr_accuracy * 0.4)
    return round(accuracy, 1)

def parse_receiver_block(block_lines):
    """
    Parse a block of lines from the Arduino Mega receiver.
    
    The receiver outputs validated alerts as labeled lines between
    ============================== delimiters:
    
        ==============================
        RAW PACKET: SOS,17.382100,78.510800
        VALID ALERT PACKET
        TYPE: SOS
        LAT: 17.382100
        LON: 78.510800
        RSSI: -45
        SNR: 12.50
        (then displayAlert is called, no more serial for this block)
    
    Invalid packets output:
        ==============================
        RAW PACKET: garbage
        INVALID/GARBAGE PACKET
        NOT DISPLAYED ON TFT
    
    Returns dict with parsed data or None if invalid/garbage.
    """
    alert_type = None
    lat = None
    lng = None
    rssi = None
    snr = None
    is_valid = False

    for line in block_lines:
        line = line.strip()

        if line == "VALID ALERT PACKET":
            is_valid = True

        elif line == "INVALID/GARBAGE PACKET":
            return None

        elif line.startswith("TYPE:"):
            alert_type = line.split(":", 1)[1].strip()

        elif line.startswith("LAT:"):
            try:
                lat = float(line.split(":", 1)[1].strip())
            except ValueError:
                pass

        elif line.startswith("LON:"):
            try:
                lng = float(line.split(":", 1)[1].strip())
            except ValueError:
                pass

        elif line.startswith("RSSI:"):
            try:
                rssi = int(line.split(":", 1)[1].strip().split()[0])
            except (ValueError, IndexError):
                pass

        elif line.startswith("SNR:"):
            try:
                snr = float(line.split(":", 1)[1].strip().split()[0])
            except (ValueError, IndexError):
                pass

    # Only return if we got a valid alert with all required fields
    if is_valid and alert_type and lat is not None and lng is not None:
        return {
            "status": alert_type,
            "lat": lat,
            "lng": lng,
            "rssi": rssi,
            "snr": snr
        }

    return None

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
    parser.add_argument("--baud", type=int, default=9600, help="Baud rate (default: 9600)")
    parser.add_argument("--api-url", default="http://localhost:8000/api/alert", help="API URL")
    parser.add_argument("--device-id", default="01", help="Device ID for this receiver node (default: 01)")
    args = parser.parse_args()

    print(f"{Fore.CYAN}{Style.BRIGHT}=========================================")
    print(f"{Fore.CYAN}{Style.BRIGHT}  RakshakNet LoRa Serial Bridge v2.2")
    print(f"{Fore.CYAN}{Style.BRIGHT}=========================================")
    print(f"{Fore.YELLOW}Target Port:  {args.port}")
    print(f"{Fore.YELLOW}Baud Rate:    {args.baud}")
    print(f"{Fore.YELLOW}API URL:      {args.api_url}")
    print(f"{Fore.YELLOW}Device ID:    DEV{str(args.device_id).zfill(3)}")
    print(f"{Fore.CYAN}{Style.BRIGHT}=========================================")
    print(f"{Fore.CYAN}Format: TYPE/LAT/LON/RSSI/SNR block lines")
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

            # Block accumulator for parsing receiver output
            block_lines = []
            in_block = False

            while True:
                if ser.in_waiting > 0:
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    # Sanitize line to prevent UnicodeEncodeError on Windows console
                    line = line.encode('ascii', 'replace').decode('ascii')
                    if not line:
                        continue
                        
                    print(f"\n{Fore.BLUE}[RAW] {line}")

                    # Detect block boundaries from receiver output
                    # The receiver prints "==============================" as delimiters
                    if "=====" in line:
                        if in_block and block_lines:
                            # We collected lines in a block, but the receiver
                            # only prints ONE delimiter line before the block
                            # (no closing delimiter). So when we see a NEW
                            # delimiter, the PREVIOUS block is complete.
                            print(f"{Fore.CYAN}[BLOCK] Processing {len(block_lines)} lines...")
                            
                            parsed = parse_receiver_block(block_lines)
                            if parsed:
                                print(f"{Fore.CYAN}[PARSED] {parsed}")

                                device_id = map_node_to_device(args.device_id)
                                help_type = map_status_to_help_type(parsed.get('status'))
                                lat = parsed.get('lat')
                                lng = parsed.get('lng')
                                rssi = parsed.get('rssi')
                                snr = parsed.get('snr')

                                # Calculate accuracy estimate from signal quality
                                accuracy = None
                                if rssi is not None and snr is not None:
                                    accuracy = estimate_accuracy(rssi, snr)
                                    print(f"{Fore.MAGENTA}[ACCURACY] Estimated: {accuracy}m (RSSI: {rssi} dBm, SNR: {snr} dB)")

                                payload = {
                                    "deviceId": device_id,
                                    "helpType": help_type,
                                    "lat": lat,
                                    "lng": lng,
                                    "rssi": rssi,
                                    "snr": snr,
                                    "accuracy": accuracy,
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
                                        print(f"{Fore.GREEN}  Type: {help_type} | Lat: {lat} | Lng: {lng}")
                                        print(f"{Fore.GREEN}  RSSI: {rssi} dBm | SNR: {snr} dB | Accuracy: {accuracy}m")
                                    else:
                                        print(f"{Fore.RED}[API ERROR] Status: {response.status_code} - {response.text}")
                                except requests.exceptions.RequestException as e:
                                    print(f"{Fore.RED}[NETWORK ERROR] Failed to post alert: {e}")
                            else:
                                # Block was invalid/garbage or incomplete — that's fine
                                if any("INVALID" in l or "GARBAGE" in l for l in block_lines):
                                    print(f"{Fore.YELLOW}[SKIP] Receiver rejected packet (invalid/garbage)")
                                else:
                                    print(f"{Fore.YELLOW}[SKIP] Block did not contain a valid alert")

                        # Start collecting a new block
                        block_lines = []
                        in_block = True

                    elif in_block:
                        block_lines.append(line)

                else:
                    # No data waiting — check if we have a pending block
                    # that hasn't been closed by another delimiter.
                    # After 200ms of silence, process the accumulated block.
                    if in_block and block_lines:
                        time.sleep(0.2)
                        if ser.in_waiting == 0:
                            print(f"{Fore.CYAN}[BLOCK] Processing {len(block_lines)} lines (timeout flush)...")

                            parsed = parse_receiver_block(block_lines)
                            if parsed:
                                print(f"{Fore.CYAN}[PARSED] {parsed}")

                                device_id = map_node_to_device(args.device_id)
                                help_type = map_status_to_help_type(parsed.get('status'))
                                lat = parsed.get('lat')
                                lng = parsed.get('lng')
                                rssi = parsed.get('rssi')
                                snr = parsed.get('snr')

                                accuracy = None
                                if rssi is not None and snr is not None:
                                    accuracy = estimate_accuracy(rssi, snr)
                                    print(f"{Fore.MAGENTA}[ACCURACY] Estimated: {accuracy}m (RSSI: {rssi} dBm, SNR: {snr} dB)")

                                payload = {
                                    "deviceId": device_id,
                                    "helpType": help_type,
                                    "lat": lat,
                                    "lng": lng,
                                    "rssi": rssi,
                                    "snr": snr,
                                    "accuracy": accuracy,
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
                                        print(f"{Fore.GREEN}  Type: {help_type} | Lat: {lat} | Lng: {lng}")
                                        print(f"{Fore.GREEN}  RSSI: {rssi} dBm | SNR: {snr} dB | Accuracy: {accuracy}m")
                                    else:
                                        print(f"{Fore.RED}[API ERROR] Status: {response.status_code} - {response.text}")
                                except requests.exceptions.RequestException as e:
                                    print(f"{Fore.RED}[NETWORK ERROR] Failed to post alert: {e}")
                            else:
                                if any("INVALID" in l or "GARBAGE" in l for l in block_lines):
                                    print(f"{Fore.YELLOW}[SKIP] Receiver rejected packet (invalid/garbage)")

                            block_lines = []
                            in_block = False
                
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
