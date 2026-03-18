# Decentralized Industrial IoT Honeypot — Command Center

> **Proactive threat intelligence for the Industrial IoT attack surface. Not just a log viewer — a real-time, distributed deception system that lures attackers in, captures their behavior, and renders it as actionable intelligence on a cinematic Command Center dashboard.**

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-Eclipse%20Mosquitto%202.0-660066?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

---

## What Is This?

Industrial IoT devices — PLCs, SCADA sensors, smart meters — are among the most targeted and least monitored systems in modern infrastructure. Traditional intrusion detection is passive: it waits for something bad to happen inside your real network.

This project flips the script. It **deploys decoy IIoT devices** that appear vulnerable, attract real-world attack traffic via the MQTT protocol, and stream every captured event to a live intelligence dashboard — in milliseconds, not minutes.

**What makes it different:**
- Decentralized mesh architecture — multiple honeypot nodes discover each other automatically and share topology data
- Proxy-based packet interception that captures raw MQTT traffic *before* it reaches the broker
- WebSocket-first backend: zero polling, pure event-driven data flow from sensor to screen
- ESP32 edge device integration — embed a physical honeypot node on your LAN

---

## System Architecture

```
                        ┌─────────────────────────────────────────┐
                        │           ATTACKER / SCANNER             │
                        └──────────────────┬──────────────────────┘
                                           │  TCP :1884
                                           ▼
                        ┌─────────────────────────────────────────┐
                        │           PROXY LOGGER (:1884)           │
                        │  Intercepts MQTT packets, logs payloads  │
                        │  Forwards to real broker transparently   │
                        └──────────────────┬──────────────────────┘
                                           │  TCP :1883
                                           ▼
                        ┌─────────────────────────────────────────┐
                        │     ECLIPSE MOSQUITTO BROKER (:1883)     │
                        │     WebSocket bridge on :9001            │
                        └──────────────────┬──────────────────────┘
                                           │  MQTT subscribe(#)
                                           ▼
                        ┌─────────────────────────────────────────┐
                        │        COLLECTOR SERVICE (:8000)         │
                        │  FastAPI + Paho MQTT                     │
                        │  • Classifies attack severity            │
                        │  • Manages peer mesh topology            │
                        │  • Broadcasts events via WebSocket       │
                        └──────────────────┬──────────────────────┘
                                           │  WebSocket /ws
                                           ▼
                        ┌─────────────────────────────────────────┐
                        │      REACT DASHBOARD (:5173)             │
                        │  Live attack feed · Network graph        │
                        │  Severity charts · Threats archive       │
                        └─────────────────────────────────────────┘

            ESP32 Nodes ──────────────────────────────────────────┘
            (Physical edge honeypots on LAN, MQTT pub/sub)
```

### Service Breakdown

| Service | Port | Role |
|---|---|---|
| `mqtt-broker` | 1883, 9001 | Eclipse Mosquitto — central MQTT message bus |
| `proxy-logger` | 1884 | Transparent TCP proxy; captures raw attack payloads |
| `collector` | 8000 | FastAPI backend; classifies, stores, and streams events |
| `frontend` | 5173 | React SPA; real-time Command Center dashboard |
| `nodered` | 1880 | Node-RED automation pipeline for custom alert workflows |

---

## Key Features

### Real-Time Threat Intelligence
- WebSocket connection from the collector pushes every captured event to all connected dashboard clients instantly — no polling
- Severity classification engine flags payloads containing exploit keywords (`exploit`, `cmd`) as **High** severity
- Rolling buffer of the 100 most recent attacks kept in memory; high-severity events are archived permanently

### Decentralized Mesh Network
- Each honeypot node announces itself on `honeypot/peers/{node_id}` with its IP, status, and timestamp
- The collector maintains a live peer map and evicts nodes not seen within 30 seconds
- Peer join/leave events are broadcast in real time so the topology graph reflects actual network state

### Proxy-Based Packet Interception
- `proxy-logger` listens on port 1884 (the "bait" port) and acts as a transparent TCP proxy
- Raw MQTT packets are logged before forwarding — capturing attacker payloads that would otherwise be invisible at the application layer

### Command Center Dashboard
- Built with React 18, Vite, and TailwindCSS; glassmorphism design language with Framer Motion animations
- Pages: Live Dashboard · Network Topology Graph · Attack Logs · Severe Threats Archive · Peer Status
- Network topology rendered with `react-force-graph-2d` — nodes are honeypot peers, edges are discovered connections

### ESP32 Edge Integration
- Companion Arduino sketch (`esp32_honeypot_client.ino`) turns an ESP32 into a physical honeypot node
- Device publishes presence and attack data over Wi-Fi directly to the MQTT broker, appearing in the mesh alongside software nodes

### Node-RED Automation Pipeline
- Embedded Node-RED instance allows no-code alert routing — send Slack messages, trigger webhooks, or log to external SIEMs when attacks are captured

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^18.2 | Component-based UI framework |
| Vite | ^5.0 | Dev server and production bundler |
| TailwindCSS | ^3.3 | Utility-first styling |
| Framer Motion | ^10.16 | Animation and transitions |
| Recharts | ^2.9 | Attack volume and severity charts |
| react-force-graph-2d | ^1.25 | Live peer topology graph |
| Lucide React | ^0.292 | Icon set |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11 | Runtime |
| FastAPI | ^0.104 | REST + WebSocket API server |
| Uvicorn | latest | ASGI server |
| Paho MQTT | <2.0 | MQTT client — broker communication |
| WebSockets | built-in | Real-time push to dashboard |

> **Why MQTT?** The MQTT pub/sub protocol is the de facto standard for IoT device communication — lightweight, low-bandwidth, and natively decentralized. Using it as the honeypot's data bus makes the simulated devices indistinguishable from real IIoT targets.

### Infrastructure & Edge
| Technology | Purpose |
|---|---|
| Docker + Compose | Full-stack containerization; single-command deployment |
| Eclipse Mosquitto 2.0 | Production-grade MQTT broker with WebSocket bridge |
| Node-RED | Visual IoT workflow automation |
| ESP32 (Arduino) | Physical edge honeypot node on LAN |

---

## Getting Started

### System Requirements
- Docker Engine 20.10+
- Docker Compose v2+
- 2 GB RAM minimum (4 GB recommended for Node-RED + all services)

### Run the Full Stack

```bash
# Clone the repo
git clone <repo-url>
cd honeypot

# Build images and start all services
docker-compose up --build

# Verify all services are healthy
docker-compose ps
```

### Service URLs

| Service | URL |
|---|---|
| Command Center Dashboard | http://localhost:5173 |
| Collector REST API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Node-RED Editor | http://localhost:1880 |
| MQTT Broker (TCP) | localhost:1883 |
| Honeypot Bait Port | localhost:1884 |

---

## Simulating Attacks

The attack simulator publishes crafted MQTT payloads — including exploit-flagged and benign variants — to the honeypot bait port, triggering the full data pipeline from capture to dashboard.

```bash
# Shell-based simulator (requires mosquitto-clients)
./attack_simulation/attack.sh

# Python-based simulator (full control over payload content and rate)
cd attack_simulation
pip install -r requirements.txt
python attacker.py
```

**What to expect on the dashboard:**
- Attack events appear on the Live Feed within ~100ms of being published
- High-severity payloads (containing `exploit` or `cmd`) are flagged in red and routed to the Threats Archive
- The attack volume chart updates in real time

---

## Engineering Highlights

These are the core design decisions that make the system work:

- **Transparent proxy interception** — Port 1884 acts as a deception layer; attackers connect thinking it's a real broker. The proxy captures their full payload stream before forwarding, enabling logging without disrupting the attacker's session.
- **Event-driven, zero-poll architecture** — The entire data path (MQTT message → FastAPI → WebSocket → React state) is push-based. No timers, no REST polling. Latency from capture to screen is sub-second.
- **Decentralized peer discovery over MQTT** — No central registry. Nodes self-announce on a known topic prefix; any collector on the mesh picks them up and builds the topology dynamically. Nodes that go silent are automatically evicted after 30 seconds.
- **Severity heuristics at the edge** — The collector classifies severity at ingest time, not query time, keeping the dashboard fast regardless of event volume.
- **Containerized, single-command deployment** — All five services (broker, proxy, collector, frontend, Node-RED) are orchestrated via Compose with a shared bridge network, making the system fully portable.

---

## Documentation

| Document | Description |
|---|---|
| [Presentation Guide & Script](presentation_guide.md) | Walkthrough and demo script for presenting the project |
| [IEEE Project Report](IEEE_Project_Report.md) | Formal technical report covering architecture, methodology, and results |
