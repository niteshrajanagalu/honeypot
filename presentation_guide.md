# Decentralized Industrial IoT Honeypot: Presentation & Technical Deep Dive

This guide is designed to help you present your project with confidence. It covers the "What", "Why", and "How" for every component in your codebase, structured as a walkthrough of your project folders.

---

## 🎤 Presentation Opening: The "Elevator Pitch"

"Good morning/afternoon. Today I am presenting a **Decentralized Industrial IoT Honeypot Command Center**.

In a world where IoT devices are constantly under attack, traditional logs are boring and reactive. I built a system that is **proactive, visual, and distributed**. It mimics vulnerable industrial devices, lures attackers in, and visualizes their behavior in real-time on a cinematic dashboard. It's not just a log viewer; it's a threat intelligence system."

---

## 📂 Folder-by-Folder Technical Walkthrough

Use this section when showing your code or explaining the architecture.

### 1. Root Directory: The Infrastructure
*Files: `docker-compose.yml`, `Dockerfile.collector`*

**What to say:**
"The entire system is containerized using Docker for portability and scalability.
*   **`docker-compose.yml`**: This is the orchestrator. It spins up 5 services:
    1.  **`mqtt-broker`**: The communication backbone (Mosquitto).
    2.  **`collector`**: The brain of the operation (Python).
    3.  **`frontend`**: The visual interface (React).
    4.  **`proxy-logger`**: A custom TCP interceptor to catch attackers.
    5.  **`nodered`**: For additional data processing flows.
*   **`Dockerfile.collector`**: Defines the environment for our backend, installing Python dependencies like `fastapi` and `paho-mqtt`."

### 2. `collector/`: The Brain
*Files: `mqtt_honeypot_collector.py`*

**What to say:**
"This is the core logic of the honeypot. It's a Python service that does three things:
1.  **Listens:** It connects to the MQTT broker and subscribes to `#` (wildcard), meaning it hears *everything*—every message sent by peers or attackers.
2.  **Analyzes:** When a message comes in, it checks the topic.
    *   If it's `honeypot/peers/`, it registers a new node in the mesh network.
    *   If it's anything else, it treats it as an attack. It analyzes the payload for keywords like 'exploit' or 'rm -rf' to assign a **Severity Score (High/Low)**.
3.  **Broadcasts:** It uses **WebSockets (`FastAPI`)** to push this data instantly to the frontend. We don't poll the server; the server pushes updates in real-time."

### 3. `proxy_logger/`: The Trap
*Files: `proxy.py`*

**What to say:**
"Smart attackers might try to bypass standard logging. To catch them, I built a custom **TCP Proxy**.
*   It sits on port **1884** (exposed to the world).
*   It forwards traffic to the real broker on port **1883**.
*   **The Magic:** It silently intercepts every byte of data passing through. It logs the raw payloads before they even reach the broker, ensuring we capture attacks even if they crash the main system."

### 4. `frontend/`: The Command Center (The "Wow" Factor)
*Tech Stack: React, Vite, TailwindCSS, Framer Motion*

#### `src/context/SocketContext.jsx` (The Data Pipeline)
**What to say:**
"This is the bridge between backend and frontend. It establishes a **WebSocket connection** to the collector. It listens for event types like `NEW_ATTACK` or `PEER_UPDATE` and updates the global React state. This ensures that when an attack happens, every component on the screen updates simultaneously without refreshing."

#### `src/pages/Dashboard.jsx` (The Main View)
**What to say:**
"This is the main control room.
*   **Real-time Charts:** I use `Recharts` to visualize traffic volume.
*   **Live Feeds:** On the right, you see a live stream of attacks. High-severity threats are highlighted in red and animated using `Framer Motion` to grab attention immediately."

#### `src/components/TopologyGraph.jsx` (The Network Map)
**What to say:**
"This is the most complex visual component. I used `react-force-graph-2d` to build an interactive force-directed graph.
*   **Nodes:** The central node is our honeypot. Blue nodes are discovered peers. Red nodes are active attackers.
*   **Physics Engine:** The graph simulates physics—nodes repel each other so they don't overlap, but links hold them together.
*   **Visual Feedback:** When an attack happens, I render a particle traveling along the link from the attacker to the honeypot, visually representing the cyber attack vector."

#### `src/pages/SevereThreatsArchive.jsx` (The Memory)
**What to say:**
"Real-time data is fleeting, so I built an Archive system.
*   **Persistence:** It automatically saves high-severity incidents to `localStorage`.
*   **Forensics:** Security analysts can come back days later, filter by 'Last 7 Days', and export the data as JSON for evidence."

### 5. `attack_simulation/`: The Proof
*Files: `attacker.py`, `attack.sh`*

**What to say:**
"To demonstrate the system, I wrote a Python script that simulates a real cyber attack.
*   It mimics a hacker's workflow: **Reconnaissance** (scanning topics) -> **Exploitation** (sending malicious payloads) -> **DoS** (flooding).
*   Running this script triggers the entire pipeline: Proxy catches it -> Collector analyzes it -> Frontend visualizes it."

---

## 🚀 How It All Works Together (The Flow)

1.  **The Trigger:** An attacker (or our simulation script) sends a malicious MQTT message to port 1884.
2.  **The Intercept:** The `proxy_logger` captures the raw packet.
3.  **The Analysis:** The `collector` sees the message, flags it as "High Severity" because it contains "rm -rf", and creates an attack object.
4.  **The Push:** The `collector` sends a JSON message over WebSocket to the Frontend.
5.  **The Visualization:**
    *   The **Dashboard** counters increment immediately.
    *   A red alert card slides into the **"Active Threats"** feed.
    *   On the **Network Map**, a new red node appears, and a laser-like particle shoots toward the center.

---

## ❓ Anticipated Q&A

*   **Q: Why use MQTT?**
    *   *A: MQTT is the standard for IoT. By using it, we make our honeypot look exactly like a factory or smart home network to an attacker.*
*   **Q: Is it safe to run?**
    *   *A: Yes, it runs in isolated Docker containers. Even if an attacker "hacks" the honeypot, they are trapped inside the container and cannot access the host machine.*
*   **Q: How does it scale?**
    *   *A: Because it's decentralized, we can spin up 100 of these containers on different servers. They will automatically discover each other and appear as a massive mesh network on the map.*
