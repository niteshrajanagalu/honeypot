<div align="center">

# 🛡️ Decentralized Industrial IoT Honeypot

### Real-time threat intelligence for Industrial IoT networks

A distributed honeypot system that mimics vulnerable IIoT devices, captures attacker behavior via MQTT, and visualizes threats in a real-time Command Center dashboard.

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](#-quick-start)
[![Python](https://img.shields.io/badge/Python-FastAPI-3776AB?logo=python&logoColor=white)](#-tech-stack)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)](#-tech-stack)
[![MQTT](https://img.shields.io/badge/MQTT-Mosquitto-660066?logo=eclipsemosquitto&logoColor=white)](#-tech-stack)
[![ESP32](https://img.shields.io/badge/ESP32-Hardware_Node-E7352C?logo=espressif&logoColor=white)](#-hardware-integration)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## The Problem

Industrial IoT devices (PLCs, sensors, SCADA systems) are among the most attacked targets on the internet. Most are deployed with default credentials, zero monitoring, and no visibility into who's probing them. Traditional security tools generate logs that nobody reads. By the time an attack is detected, the damage is done.

## What This Does

This system **flips the script** — instead of defending, it lures attackers in.

It deploys decoy IoT devices (honeypots) that look like real industrial systems. When attackers probe, scan, or attempt to compromise these decoys, every action is captured, classified by severity, and visualized in real-time on a cinematic Command Center dashboard.

**Think of it as a security camera system, but for your network — and attackers don't know they're being watched.**

---

## Architecture

```
                         ┌─────────────────────────────────────┐
                         │       COMMAND CENTER DASHBOARD       │
                         │   React + Vite + TailwindCSS         │
                         │   Real-time WebSocket feed            │
                         │   Threat classification & archive     │
                         └──────────────┬──────────────────────┘
                                        │ WebSocket (live data)
                                        │
                         ┌──────────────▼──────────────────────┐
                         │         COLLECTOR / API SERVER        │
                         │   Python + FastAPI                    │
                         │   Threat classification engine        │
                         │   Severity scoring                    │
                         │   Persistent threat archive           │
                         └──────────────┬──────────────────────┘
                                        │ MQTT Subscribe (#)
                                        │
                         ┌──────────────▼──────────────────────┐
                         │         MOSQUITTO MQTT BROKER         │
                         │   Central message bus                 │
                         │   Port 1883 (internal)                │
                         │   Port 9001 (WebSocket)               │
                         └──────┬───────────────┬──────────────┘
                                │               │
               ┌────────────────▼───┐   ┌───────▼────────────────┐
               │   PROXY LOGGER      │   │   NODE-RED              │
               │   Port 1884 (trap)  │   │   Workflow automation   │
               │   Intercepts all    │   │   Alert routing         │
               │   attacker traffic  │   │   Custom triggers       │
               └────────────────────┘   └────────────────────────┘
                        ▲
                        │ Attacker connects
                        │ (thinks it's a real device)
                        │
               ┌────────┴────────────┐
               │   ATTACKER           │
               │   Scans, probes,     │
               │   sends payloads     │
               └─────────────────────┘

     ┌──────────────────────────────────────────────┐
     │   ESP32 HARDWARE NODES (Optional)             │
     │   Physical honeypot devices on real networks   │
     │   Publish telemetry + trap data via MQTT       │
     └──────────────────────────────────────────────┘
```

---

## Key Features

**Threat Intelligence Pipeline**
- Proxy logger on port 1884 intercepts all incoming MQTT traffic from attackers
- Automatic threat classification (severity scoring based on payload analysis)
- Real-time WebSocket stream from collector to dashboard — zero polling, instant updates

**Decentralized Mesh Design**
- Multiple honeypot nodes (software or ESP32 hardware) report to a central broker
- Automatic peer discovery and topology mapping
- Scales horizontally — add more nodes, get more coverage

**Command Center Dashboard**
- Glassmorphism UI with animated real-time statistics
- Live attack feed with severity color coding
- Severe threats archive with export capabilities
- Network topology visualization

**Hardware Integration**
- ESP32 Arduino client included (`esp32_honeypot_client.ino`)
- Deploy physical honeypot nodes on real networks
- Reports back to the central system via MQTT

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React, Vite, TailwindCSS, Recharts, Framer Motion | Real-time dashboard |
| Backend | Python, FastAPI, Paho MQTT | Collector, API, threat engine |
| Messaging | Eclipse Mosquitto | MQTT broker (central bus) |
| Automation | Node-RED | Alert workflows, custom triggers |
| Infrastructure | Docker, Docker Compose | One-command deployment |
| Hardware | ESP32 (Arduino) | Physical honeypot nodes |

---

## Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run the entire system

```bash
git clone https://github.com/niteshrajanagalu/honeypot.git
cd honeypot
docker-compose up --build
```

### Access points

| Service | URL | Purpose |
|---------|-----|---------|
| Dashboard | `http://localhost:5173` | Command Center UI |
| Collector API | `http://localhost:8000` | REST API + WebSocket |
| Node-RED | `http://localhost:1880` | Workflow editor |
| MQTT Broker | `localhost:1883` | Internal MQTT |
| Honeypot Trap | `localhost:1884` | Attacker-facing port |

### Simulate an attack

```bash
./attack_simulation/attack.sh
```

This sends crafted MQTT payloads to port 1884, mimicking real attacker behavior. Watch the dashboard light up in real-time.

---

## Hardware Integration

The system includes an ESP32 Arduino client that turns a $3 microcontroller into a physical honeypot node.

```
ESP32 Node                    Central System
┌──────────┐    MQTT Publish   ┌──────────────┐
│ Listens  │ ───────────────→  │ Mosquitto    │
│ for      │   attack data     │ Broker       │
│ probes   │                   │ → Collector  │
│ on WiFi  │                   │ → Dashboard  │
└──────────┘                   └──────────────┘
```

Flash `esp32_honeypot_client.ino` to an ESP32, configure WiFi + broker IP, and deploy it on any network you want to monitor.

---

## Project Structure

```
honeypot/
├── frontend/                  # React dashboard (Vite + Tailwind)
├── collector/                 # FastAPI backend + threat engine
├── proxy_logger/              # MQTT proxy (attacker-facing trap)
├── attack_simulation/         # Scripts to simulate attacks
├── mosquitto/config/          # Mosquitto broker configuration
├── node_red_data/             # Node-RED flow definitions
├── esp32_honeypot_client.ino  # Arduino code for ESP32 nodes
├── docker-compose.yml         # Full system orchestration
├── Dockerfile.collector       # Collector container build
├── IEEE_Project_Report.md     # Formal technical report
└── presentation_guide.md      # Presentation walkthrough
```

---

## How It Works (Step by Step)

1. **Attacker discovers port 1884** — it looks like an open MQTT broker on a vulnerable IoT device
2. **Proxy Logger intercepts** — all traffic is captured and forwarded to the real broker on 1883
3. **Collector subscribes to all topics** — receives every message, classifies severity, stores threats
4. **Dashboard updates in real-time** — WebSocket pushes new attacks to the UI instantly
5. **Node-RED triggers alerts** — configurable workflows can send notifications, block IPs, or log to external systems
6. **ESP32 nodes extend coverage** — physical devices on remote networks report back to the central system

---

## Documentation

- **[IEEE Technical Report](IEEE_Project_Report.md)** — Formal paper covering architecture, methodology, and results
- **[Presentation Guide](presentation_guide.md)** — Walkthrough script for demos and presentations

---

## Recognition

- 🥉 **3rd Place** — Hackathon (Cybersecurity Track)
- **4th Place** — Hackathon (IoT Security Category)

---

## Built By

**Nitesh Raja Nagalu** — Cybersecurity & IoT Engineering Student

- [GitHub](https://github.com/niteshrajanagalu)
- [LinkedIn](https://linkedin.com/in/niteshrajanagalu)

---

## License

This project is open source under the [MIT License](LICENSE).

---

<div align="center">

*If you found this useful, consider giving it a ⭐*

</div>
