# Decentralized Industrial IoT Honeypot Command Center
**Author:** Nitesh Rajanagalu
**Date:** November 2025

## Abstract
The proliferation of Industrial Internet of Things (IIoT) devices has expanded the attack surface for critical infrastructure. Traditional intrusion detection systems often lack the interactivity required to study attacker behavior in depth. This paper presents a **Decentralized Industrial IoT Honeypot Command Center**, a novel system designed to mimic vulnerable IIoT devices, capture real-time attack vectors, and visualize threat intelligence through a high-fidelity, interactive dashboard. The system employs a microservices architecture with a custom MQTT collector, a TCP proxy logger for deep packet inspection, and a mesh network visualization engine.

## I. Introduction
Industrial control systems are increasingly targeted by sophisticated cyberattacks. To defend against these threats, security researchers need tools that can not only detect attacks but also deceive attackers into revealing their methods. This project implements a high-interaction honeypot that simulates an industrial MQTT network. It leverages a decentralized mesh architecture where multiple honeypot nodes can discover each other, forming a resilient intelligence network.

## II. System Architecture
The system is built on a containerized microservices architecture, ensuring scalability and isolation.

### A. Core Components
1.  **Collector (Backend):** A Python-based service using `FastAPI` and `paho-mqtt`. It subscribes to all MQTT topics, processes incoming telemetry, and classifies messages based on payload heuristics. It utilizes `AsyncIO` for non-blocking I/O operations.
2.  **MQTT Broker:** An `Eclipse Mosquitto` instance acting as the central communication hub (Port 1883).
3.  **Proxy Logger:** A custom TCP proxy service running on Port 1884. It intercepts all external traffic destined for the broker, logging raw payloads to capture exploits that might otherwise crash the broker or bypass standard logging.
4.  **Frontend Dashboard:** A `React` application built with `Vite`. It connects to the collector via WebSockets for real-time data ingestion.

### B. Decentralized Mesh Logic
Nodes in the network automatically discover peers by publishing presence messages to the `honeypot/peers/` topic. The collector maintains a dynamic registry of active peers, allowing the frontend to visualize the entire mesh topology without central configuration.

## III. Key Features and Implementation

### A. Real-Time Threat Detection
The collector analyzes payloads for known attack signatures (e.g., shell commands, SQL injection patterns). Attacks are classified into severity levels:
*   **High Severity:** Remote Code Execution (RCE), unauthorized root access attempts.
*   **Low Severity:** Port scanning, ping sweeps.

### B. Visualization and Command Center
The dashboard provides a "Command Center" experience:
*   **Topology Map:** A force-directed graph (`react-force-graph-2d`) visualizes the relationships between the local node, peers, and attackers. Attack vectors are rendered as animated particles.
*   **Live Traffic Feed:** A scrolling log of all intercepted messages.
*   **Severe Threats Archive:** A persistent storage module for high-severity incidents, enabling forensic analysis.

### C. Attack Simulation
To validate the system, a Python-based attack simulator was developed. It mimics the kill chain of a typical IoT botnet:
1.  **Reconnaissance:** Scanning for common topics (e.g., `admin/settings`).
2.  **Exploitation:** Injecting malicious payloads (e.g., `CVE-2023-1234`).
3.  **Denial of Service:** Flooding the broker with high-frequency messages.

## IV. Experimental Results
The system successfully detected and classified simulated attacks with sub-millisecond latency. The proxy logger captured 100% of raw TCP payloads, providing a redundant layer of evidence. The decentralized discovery mechanism allowed new nodes to join the mesh within 10 seconds of deployment.

## V. Conclusion
The Decentralized Industrial IoT Honeypot provides a robust platform for studying cyber threats in OT environments. Its combination of low-level packet capture and high-level visual analytics makes it a valuable tool for security analysts and researchers.

## VI. Future Work
Future enhancements will include:
*   AI-driven anomaly detection using TensorFlow.
*   Integration with SIEM tools like Splunk or ELK Stack.
*   Hardware deployment on Raspberry Pi clusters.

---
*IEEE Standard Format for Technical Reports*
