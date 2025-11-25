import time
import socket
import json
import uuid
import threading
import logging
import asyncio
import paho.mqtt.client as mqtt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
from typing import List

# Configuration
BROKER = 'mqtt-broker'
PORT = 1883
NODE_ID = str(uuid.uuid4())[:8]
PEER_TOPIC = "honeypot/peers/"
ATTACK_TOPIC = "honeypot/attacks"

# State
peers = {}
attacks = []
active_connections: List[WebSocket] = []

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("collector")

# FastAPI App
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@app.get("/status")
def get_status():
    return {"node_id": NODE_ID, "uptime": "running", "peers_count": len(peers)}

@app.get("/peers")
def get_peers():
    return peers

@app.get("/attacks")
def get_attacks():
    return attacks

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state
        await websocket.send_json({"type": "INIT", "node_id": NODE_ID, "peers": peers, "attacks": attacks})
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    logger.info(f"Connected to MQTT Broker with result code {rc}")
    logger.info("Subscribing to all topics (#)...")
    client.subscribe("#")
    logger.info("Subscription complete")

def on_message(client, userdata, msg):
    logger.info(f"MQTT message received on topic: {msg.topic}")
    topic = msg.topic
    payload = msg.payload.decode(errors='ignore')
    
    # Handle Peer Discovery
    if topic.startswith(PEER_TOPIC):
        peer_id = topic.split("/")[-1]
        if peer_id != NODE_ID:
            try:
                data = json.loads(payload)
                # Force server timestamp for accuracy
                data['timestamp'] = time.time()
                peers[peer_id] = data
                peers[peer_id]['last_seen'] = time.time()
                # Broadcast peer update
                asyncio.run(manager.broadcast({"type": "PEER_UPDATE", "peer_id": peer_id, "data": data}))
            except:
                pass
        return

    # Handle Attacks (everything except peer discovery)
    if not topic.startswith(PEER_TOPIC):  # Changed from "honeypot/" to PEER_TOPIC
        logger.info(f"Attack captured on {topic}: {payload}")
        attack_record = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "topic": topic,
            "payload": payload,
            "node_id": NODE_ID,
            "severity": "High" if "exploit" in payload.lower() or "cmd" in payload.lower() else "Low"
        }
        attacks.append(attack_record)
        # Keep only last 100 attacks
        if len(attacks) > 100:
            attacks.pop(0)
        
        # Broadcast attack
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(manager.broadcast({"type": "NEW_ATTACK", "data": attack_record}))
            loop.close()
        except Exception as e:
            logger.error(f"Failed to broadcast attack: {e}")

def get_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def announce_presence(client):
    while True:
        payload = json.dumps({
            "node_id": NODE_ID,
            "status": "online",
            "timestamp": time.time(),
            "ip": get_ip()
        })
        client.publish(f"{PEER_TOPIC}{NODE_ID}", payload, retain=True)
        time.sleep(10)

def start_api():
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Main
if __name__ == "__main__":
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message

    while True:
        try:
            client.connect(BROKER, PORT, 60)
            break
        except:
            logger.info("Waiting for broker...")
            time.sleep(2)

    # Start MQTT loop in background
    client.loop_start()
    
    # Start announcement thread
    announce_thread = threading.Thread(target=announce_presence, args=(client,), daemon=True)
    announce_thread.start()

    # Start API server (this will block and keep the program running)
    start_api()

