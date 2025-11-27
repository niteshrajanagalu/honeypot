# Decentralized Industrial IoT Honeypot Command Center

> **"In a world where IoT devices are constantly under attack, traditional logs are boring and reactive. This system is proactive, visual, and distributed. It mimics vulnerable industrial devices, lures attackers in, and visualizes their behavior in real-time on a cinematic dashboard. It's not just a log viewer; it's a threat intelligence system."**

## 🚀 Project Overview
This project is a real-time, distributed threat intelligence system designed to mimic vulnerable Industrial IoT (IIoT) devices. It captures attacks and visualizes the threat landscape in a high-fidelity "Command Center" dashboard.

## 📂 Documentation
- **[Presentation Guide & Script](presentation_guide.md)**: Detailed walkthrough and script for presenting the project.
- **[IEEE Project Report](IEEE_Project_Report.md)**: Formal technical report covering architecture and results.

## ✨ Key Features
- **Real-Time Threat Intelligence**: Live monitoring via WebSockets with automatic threat classification.
- **Decentralized Mesh Network**: Automatic peer discovery and topology visualization.
- **"Command Center" Dashboard**: A sci-fi inspired interface with glassmorphism effects and animated statistics.
- **Severe Threats Archive**: Permanent storage for high-severity incidents with export capabilities.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Recharts, Framer Motion
- **Backend**: Python, FastAPI, Paho MQTT
- **Infrastructure**: Docker, Docker Compose, Mosquitto MQTT Broker

## 🚦 Getting Started

### Prerequisites
- Docker & Docker Compose

### Installation
1. Clone the repository
2. Run the system:
   ```bash
   docker-compose up --build
   ```
3. Access the dashboard at `http://localhost:5173`

## 🧪 Simulating Attacks
To see the system in action, run the included attack simulation:
```bash
./attack_simulation/attack.sh
```
